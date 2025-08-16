import { useEffect } from 'react';
import '@/features/liveAudio/GdmLiveAudio';

export default function LiveAudioPage() {
	useEffect(() => {
		// ensure audio context can start on user gesture policies
		const handler = () => {
			/* no-op to satisfy mobile autoplay policies */
		};
		document.addEventListener('click', handler, { once: true });
		return () => document.removeEventListener('click', handler);
	}, []);

	return (
		<div style={{ position: 'relative', minHeight: '100vh', background: '#000', color: '#fff' }}>
			<gdm-live-audio></gdm-live-audio>
		</div>
	);
}


