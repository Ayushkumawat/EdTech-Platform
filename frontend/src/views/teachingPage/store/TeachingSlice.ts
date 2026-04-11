import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiGetChapterContent, apiGetChapterProgress, apiPutChapterProgress } from '@/services/ChapterServices';
export const SLICE_NAME = 'teaching';
export type ChapterContent = {
  uid: string;
  title: string;
  pages: string[];
  book_id: string;
};

export type TranscriptMessage = {
  role: 'user' | 'model';
  text: string;
};

export type TeachingState = {
  isPlaying: boolean;
  frequencyData: number[];
  chapter_completion_id: string | null;
  dotAnimation: boolean;
  mobileVisual: boolean;
  chapterData: ChapterContent | null;
  chapterLoading: boolean;
  error: any;
  notification: any;
  currentPage: number | null;
  inputPage: number | null;
  startButton: boolean;
  streamingUserText: string;
  streamingModelText: string;
  liveTranscripts: TranscriptMessage[];
}

const initialState: TeachingState = {
  isPlaying: false,
  frequencyData: [],
  chapterData: null,
  chapter_completion_id: null,
  chapterLoading: false,
  dotAnimation: false,
  mobileVisual: false,
  error: null,
  notification: null,
  currentPage: null,
  inputPage: 0,
  startButton: true,
  streamingUserText: '',
  streamingModelText: '',
  liveTranscripts: [],
};

export const getChapterData = createAsyncThunk(
  SLICE_NAME + '/getChapterData',
  async (chapterId: string, { rejectWithValue }) => {
      try {
          const response = await apiGetChapterContent<ChapterContent>(chapterId);
          return response.data;
      } catch (error: any) {
          if (error.response && error.response.data) {
              return rejectWithValue(error.response.data);
          }
          return rejectWithValue({ detail: "An unknown error occurred." });
      }
  }
)

// Type for chapter progress response
type ChapterProgress = {
  current_page: number;
  uid:string
  // Add other fields if needed
};

export const getChapterProgress = createAsyncThunk(
  SLICE_NAME + '/getChapterProgress',
  async (chapterId: string, { rejectWithValue }) => {
      try {
          const response = await apiGetChapterProgress<ChapterProgress>(chapterId);
          return response.data;
      } catch (error: any) {
          if (error.response && error.response.data) {
              return rejectWithValue(error.response.data);
          }
          return rejectWithValue({ detail: "An unknown error occurred." });
      }
  }
)

// Type for chapter progress update request/response
interface ChapterProgressUpdate {
  current_page: number;
  uid:string
  // Add other fields if needed
}

export const putChapterProgress = createAsyncThunk(
  SLICE_NAME + '/putChapterProgress',
  async (chapterProgessData: ChapterProgressUpdate, { rejectWithValue }) => {
    try {
      const response = await apiPutChapterProgress<ChapterProgressUpdate>(chapterProgessData);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ detail: 'An unknown error occurred.' });
    }
  }
);

const teachingSlice = createSlice({
  name: `${SLICE_NAME}/state`,
  initialState,
  reducers: {
    setFrequencyData(state, action) {
      state.frequencyData = action.payload;
    },
    setIsPlaying(state, action) {
      state.isPlaying = action.payload;
    },
    setDotAnimation(state, action) {
      state.dotAnimation = action.payload
    },
    setMobileVisual(state, action) {
      state.mobileVisual = action.payload
    },
    setCurrentPage(state, action) {
      state.currentPage = action.payload
    },
    setInputPage(state, action) {
      state.inputPage = action.payload
    },
    setStartButton(state, action) {
      state.startButton = action.payload;
    },
    appendStreamingUserText(state, action: PayloadAction<string>) {
      state.streamingUserText += action.payload;
    },
    appendStreamingModelText(state, action: PayloadAction<string>) {
      state.streamingModelText += action.payload;
    },
    flushUserTranscript(state) {
      const text = state.streamingUserText.trim();
      if (text) {
        state.liveTranscripts.push({ role: 'user', text });
      }
      state.streamingUserText = '';
    },
    flushModelTranscriptToChat(state) {
      const text = state.streamingModelText.trim();
      if (text) {
        state.liveTranscripts.push({ role: 'model', text });
      }
      state.streamingModelText = '';
    },
    addUserMessage(state, action: PayloadAction<string>) {
      const text = action.payload.trim();
      if (text) {
        state.liveTranscripts.push({ role: 'user', text });
      }
    },
    clearLiveTranscripts(state) {
      state.liveTranscripts = [];
      state.streamingUserText = '';
      state.streamingModelText = '';
    },
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
        .addCase(getChapterData.fulfilled, (state, action) => {
                  state.chapterData = action.payload
                  state.chapterLoading = false
              })
              .addCase(getChapterData.pending, (state) => {
                  state.chapterLoading = true
              })
              .addCase(getChapterData.rejected, (state, action: any) => {
                  state.error = action.payload.detail
                  state.chapterLoading = false
                  state.notification = { type: 'danger', message: 'Ooop! Please try after sometime.' }
              })
        // Add case for getChapterProgress
        .addCase(getChapterProgress.fulfilled, (state, action) => {
            state.chapter_completion_id=action.payload.uid
            if (typeof action.payload.current_page === 'number') {
              state.currentPage = action.payload.current_page;
              state.inputPage = 0
            }
        })
        .addCase(getChapterProgress.rejected, (state, action: any) => {
            state.error = action.payload?.detail || 'Failed to fetch chapter progress.';
            state.notification = { type: 'danger', message: 'Failed to fetch chapter progress.' }
        })
   
        .addCase(putChapterProgress.fulfilled, (state, action) => {
          
          // Optionally update currentPage/inputPage if returned
          if (typeof action.payload.current_page === 'number') {
            state.currentPage = action.payload.current_page;
            state.inputPage = 0;
          }
        })
        .addCase(putChapterProgress.rejected, (state, action: any) => {
         
          state.error = action.payload?.detail || 'Failed to update chapter progress.';
          state.notification = { type: 'danger', message: 'Failed to update chapter progress.' };
        })
  },
});

export const {
  resetError, setFrequencyData, setIsPlaying, setDotAnimation, setMobileVisual,
  setCurrentPage, setInputPage, setStartButton,
  appendStreamingUserText, appendStreamingModelText,
  flushUserTranscript, flushModelTranscriptToChat, clearLiveTranscripts, addUserMessage,
} = teachingSlice.actions;

export default teachingSlice.reducer;
