/* tslint:disable */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, LiveServerMessage, Modality, Session } from '@google/genai';
import { LitElement, css, html } from 'lit';
import { createBlob, decode, decodeAudioData } from './utils';
import './Visuals3D';

export class GdmLiveAudio extends LitElement {
	static styles = css`
		#status {
			position: absolute;
			bottom: 5vh;
			left: 0;
			right: 0;
			z-index: 10;
			text-align: center;
		}

		.controls {
			z-index: 10;
			position: absolute;
			bottom: 10vh;
			left: 0;
			right: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
			gap: 10px;
		}

		.controls button {
			outline: none;
			border: 1px solid rgba(255, 255, 255, 0.2);
			color: white;
			border-radius: 12px;
			background: rgba(255, 255, 255, 0.1);
			width: 64px;
			height: 64px;
			cursor: pointer;
			font-size: 24px;
			padding: 0;
			margin: 0;
		}

		.controls button:hover {
			background: rgba(255, 255, 255, 0.2);
		}

		.controls button[disabled] {
			display: none;
		}
	`;

	static properties = {
		isRecording: { state: true },
		status: { state: true },
		error: { state: true },
		inputNode: { state: true },
		outputNode: { state: true },
	};

	declare isRecording: boolean;
	declare status: string;
	declare error: string;
	declare inputNode: GainNode;
	declare outputNode: GainNode;

	private client!: GoogleGenAI;
	private session?: Session;
	private inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
	private outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
	private nextStartTime = 0;
	private mediaStream?: MediaStream;
	private sourceNode?: MediaStreamAudioSourceNode;
	private scriptProcessorNode?: ScriptProcessorNode;
	private sources = new Set<AudioBufferSourceNode>();
	private isSessionOpen = false;
	private sessionOpenPromise?: Promise<boolean>;
	private resolveSessionOpen?: (value: boolean) => void;

	constructor() {
		super();
		this.isRecording = false;
		this.status = '';
		this.error = '';
		this.inputNode = this.inputAudioContext.createGain();
		this.outputNode = this.outputAudioContext.createGain();
		this.initClient();
	}

	private initAudio() {
		this.nextStartTime = this.outputAudioContext.currentTime;
	}

	private async initClient() {
		this.initAudio();

		const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
		if (!apiKey) {
			this.updateError('Missing VITE_GEMINI_API_KEY. Please set it in your .env file.');
			return;
		}

		this.client = new GoogleGenAI({
			apiKey,
		});

		this.outputNode.connect(this.outputAudioContext.destination);

		this.initSession();
	}

	private async initSession() {
		const model = 'gemini-2.5-flash-preview-native-audio-dialog';

		try {
			this.isSessionOpen = false;
			this.sessionOpenPromise = new Promise<boolean>((resolve) => {
				this.resolveSessionOpen = resolve;
			});
			this.session = await this.client.live.connect({
				model,
				callbacks: {
					onopen: () => {
						this.updateStatus('Opened');
						this.isSessionOpen = true;
						this.resolveSessionOpen?.(true);
						// Kickoff: ask the model to speak a ready message to verify output path
						try {
							(this.session as any)?.send?.({
								clientContent: [
									{
										role: 'user',
										parts: [{ text: 'Say: Hello, I am ready to chat.' }],
									},
								],
							});
						} catch {}
					},
					onmessage: async (message: LiveServerMessage) => {
						const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData as
							| { data: string }
							| undefined;

						if (audio) {
							this.updateStatus('↘️ Audio chunk received');
							this.nextStartTime = Math.max(
								this.nextStartTime,
								this.outputAudioContext.currentTime
							);

							const audioBuffer = await decodeAudioData(
								decode(audio.data),
								this.outputAudioContext,
								24000,
								1
							);
							const source = this.outputAudioContext.createBufferSource();
							source.buffer = audioBuffer;
							source.connect(this.outputNode);
							this.updateStatus('🔊 Playing response...');
							source.addEventListener('ended', () => {
								this.sources.delete(source);
							});

							source.start(this.nextStartTime);
							this.nextStartTime = this.nextStartTime + audioBuffer.duration;
							this.sources.add(source);
						}

						const interrupted = (message.serverContent as any)?.interrupted as boolean | undefined;
						if (interrupted) {
							for (const source of this.sources.values()) {
								source.stop();
								this.sources.delete(source);
							}
							this.nextStartTime = 0;
						}
					},
					onerror: (e: ErrorEvent) => {
						this.updateError(e.message);
						this.isSessionOpen = false;
						if (this.isRecording) {
							this.stopRecording();
						}
					},
					onclose: (e: CloseEvent) => {
						this.updateStatus('Close: ' + e.reason);
						this.isSessionOpen = false;
						this.resolveSessionOpen?.(false);
						if (this.isRecording) {
							this.stopRecording();
						}
					},
				},
				config: {
					responseModalities: [Modality.AUDIO],
					speechConfig: {
						voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Orus' } },
						// languageCode: 'en-GB'
					},
				},
			});
		} catch (e) {
			console.error(e);
			this.isSessionOpen = false;
			this.resolveSessionOpen?.(false);
		}
	}

	private async waitForSessionOpen(timeoutMs = 5000): Promise<boolean> {
		if (this.isSessionOpen) return true;
		if (!this.sessionOpenPromise) {
			this.initSession();
		}
		const promise = this.sessionOpenPromise!;
		return await new Promise<boolean>((resolve) => {
			const t = setTimeout(() => resolve(false), timeoutMs);
			promise.then((ok) => {
				clearTimeout(t);
				resolve(!!ok);
			});
		});
	}

	private updateStatus(msg: string) {
		this.status = msg;
		this.requestUpdate();
	}

	private updateError(msg: string) {
		this.error = msg;
		this.requestUpdate();
	}

	private async startRecording() {
		if (this.isRecording) {
			return;
		}

		const ready = await this.waitForSessionOpen(8000);
		if (!ready) {
			this.updateError('Live session is not ready. Try Reset and Start again.');
			return;
		}

		await this.inputAudioContext.resume();
		await this.outputAudioContext.resume();

		this.updateStatus('Requesting microphone access...');

		try {
			this.mediaStream = await navigator.mediaDevices.getUserMedia({
				audio: true,
				video: false,
			});

			this.updateStatus('Microphone access granted. Starting capture...');

			this.sourceNode = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
			this.sourceNode.connect(this.inputNode);

			const bufferSize = 1024;
			this.scriptProcessorNode = this.inputAudioContext.createScriptProcessor(bufferSize, 1, 1);

			this.scriptProcessorNode.onaudioprocess = (audioProcessingEvent) => {
				if (!this.isRecording || !this.isSessionOpen) return;

				const inputBuffer = audioProcessingEvent.inputBuffer;
				const pcmData = inputBuffer.getChannelData(0);

				try {
					const blob = createBlob(pcmData);
					this.session?.sendRealtimeInput?.({ media: blob } as any);
				} catch (err: any) {
					const msg = String(err?.message ?? err ?? '');
					if (msg.includes('CLOSING') || msg.includes('CLOSED')) {
						this.isSessionOpen = false;
						this.updateError('Live session closed while sending audio. Reinitializing...');
						this.stopRecording();
						this.initSession();
					}
				}
			};

			this.sourceNode.connect(this.scriptProcessorNode);
			// Connect to destination so onaudioprocess fires; we don't write output so no loopback
			this.scriptProcessorNode.connect(this.inputAudioContext.destination);

			this.isRecording = true;
			this.updateStatus('🔴 Recording... Capturing PCM chunks.');
		} catch (err: any) {
			console.error('Error starting recording:', err);
			this.updateStatus(`Error: ${err?.message ?? String(err)}`);
			this.stopRecording();
		}
	}

	private stopRecording() {
		if (!this.isRecording && !this.mediaStream && !this.inputAudioContext) return;

		this.updateStatus('Stopping recording...');

		this.isRecording = false;

		if (this.scriptProcessorNode && this.sourceNode && this.inputAudioContext) {
			this.scriptProcessorNode.disconnect();
			this.sourceNode.disconnect();
		}

		this.scriptProcessorNode = undefined;
		this.sourceNode = undefined;

		if (this.mediaStream) {
			this.mediaStream.getTracks().forEach((track) => track.stop());
			this.mediaStream = undefined;
		}

		// Stop sending audio frames if session is not open
		if (!this.isSessionOpen) {
			try {
				this.session?.close();
			} catch {}
		}
		// Try to commit the user turn so the model responds
		try {
			(this.session as any)?.commit?.();
		} catch {}

		this.updateStatus('Recording stopped. Click Start to begin again.');
	}

	private reset = () => {
		try {
			this.session?.close();
		} catch {}
		this.initSession();
		this.updateStatus('Session cleared.');
	};

	protected render() {
		return html`
			<div>
				<div class="controls">
					<button id="resetButton" @click=${this.reset} ?disabled=${this.isRecording}>
						<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#ffffff">
							<path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
						</svg>
					</button>
					<button id="startButton" @click=${this.startRecording} ?disabled=${this.isRecording}>
						<svg viewBox="0 0 100 100" width="32px" height="32px" fill="#c80000" xmlns="http://www.w3.org/2000/svg">
							<circle cx="50" cy="50" r="50" />
						</svg>
					</button>
					<button id="stopButton" @click=${this.stopRecording} ?disabled=${!this.isRecording}>
						<svg viewBox="0 0 100 100" width="32px" height="32px" fill="#000000" xmlns="http://www.w3.org/2000/svg">
							<rect x="0" y="0" width="100" height="100" rx="15" />
						</svg>
					</button>
				</div>

				<div id="status">${this.error || this.status}</div>
				<gdm-live-audio-visuals-3d .inputNode=${this.inputNode} .outputNode=${this.outputNode}></gdm-live-audio-visuals-3d>
			</div>
		`;
	}
}

if (!customElements.get('gdm-live-audio')) {
	customElements.define('gdm-live-audio', GdmLiveAudio);
}


