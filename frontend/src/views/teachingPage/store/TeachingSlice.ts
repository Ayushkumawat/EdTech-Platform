import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiGetChapterContent } from '@/services/ChapterServices';
export const SLICE_NAME = 'teaching';
export type ChapterContent = {
  uid: string;
  title: string;
  pages: string[];
  book_id: string;
};

export type TeachingState ={
  isPlaying: boolean;
  frequencyData: number[];
  dotAnimation: boolean;
  mobileVisual: boolean;
  chapterData: ChapterContent | null;
  chapterLoading: boolean;
  error: any;
  notification: any;
}

const initialState: TeachingState = {
  isPlaying: false,
  frequencyData: [],
  chapterData: null,
  chapterLoading: false,
  dotAnimation: false,
  mobileVisual: false,
  error: null,
  notification: null
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
    resetError: (state) => {
      state.error = null
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
            }
});

export const { resetError, setFrequencyData, setIsPlaying, setDotAnimation, setMobileVisual } = teachingSlice.actions;

export default teachingSlice.reducer;
