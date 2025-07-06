import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiGetLessonContent } from '@/services/BooksServices';
export const SLICE_NAME = 'teaching';
export type LessonContent = {
  uid:string;
  title: string;
  content: string;
};

export type TeachingState ={
  isPlaying: boolean;
  frequencyData: number[];
  dotAnimation:boolean;
  mobileVisual:boolean;
  lessonData:any;
  lessonLoading:boolean;
  error:any;
  notification:any;
}


const initialState: TeachingState = {
  isPlaying: false,
  frequencyData: [],
  lessonData:null,
  lessonLoading:false,
  dotAnimation:false,
  mobileVisual:false,
  error:null,
  notification:null
};

export const getLessonData = createAsyncThunk(
  SLICE_NAME + '/getLessonData',
  async (lessonId: string, { rejectWithValue }) => {
      
      try {
          const response = await apiGetLessonContent<LessonContent>(lessonId);
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
      state.frequencyData = action.payload; // Update the frequency data
    },
    setIsPlaying(state, action) {
      state.isPlaying = action.payload; // Update the playing state
    },
    setDotAnimation(state,action){
        state.dotAnimation=action.payload
    },
    setMobileVisual(state,action){
      state.mobileVisual=action.payload
    },
    resetError: (state) => {
      state.error = null
    }

  },
  extraReducers: (builder) => {
    builder
        .addCase(getLessonData.fulfilled, (state, action) => {
                  
                  state.lessonData = action.payload
                  state.lessonLoading = false
              })
              .addCase(getLessonData.pending, (state) => {
                  state.lessonLoading = true
              })
              .addCase(getLessonData.rejected, (state, action:any) => {
                  state.error = action.payload.detail
                  state.lessonLoading = false
                  
                  state.notification = { type: 'danger', message: 'Ooop! Please try after sometime.' }
              })
            }
});

export const { resetError,setFrequencyData, setIsPlaying,setDotAnimation,setMobileVisual } = teachingSlice.actions;

export default teachingSlice.reducer;
