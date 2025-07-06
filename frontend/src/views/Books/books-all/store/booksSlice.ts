import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiGetSubjectBookByClass, apiGetBookDetail } from '@/services/BooksServices'

export type Chapter = {
    uid: string;
    title: string;
    description: string;
    // Add other chapter properties as needed
};

export type Review = {
    uid: string;
    rating: number;
    comment: string;
    // Add other review properties as needed
};

export type Book = {
    name: string;
    medium: string;
    subject_id: string;
    class_id: string;
    teacher: string;
    duration: string;
    description: string;
    uid: string;
    chapters: Chapter[];
    reviews: Review[];
};

export type Subject = {
    name: string;
    description: string;
    class_id: string;
    uid: string;
};

export type ClassBooksResponse = {
    books: Book[];
    subjects: Subject[];
};

export type BookState = {
    bookLoading: boolean
    detailLoading: boolean
    booksData: Book[]
    subjectsData: Subject[]
    bookDetail: Book | null
    error: any
    notification: any;
}

export const SLICE_NAME = 'book_all'

export const getBooksData = createAsyncThunk(
    SLICE_NAME + '/getBooksData',
    async (classId: string, { rejectWithValue }) => {
        try {
            const response = await apiGetSubjectBookByClass<ClassBooksResponse>(classId)
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                console.log(error)
                return rejectWithValue(error.response.data)
            }
            return rejectWithValue({ detail: "An unknown error occurred." })
        }
    }
)

export const getBookDetail = createAsyncThunk(
    SLICE_NAME + '/getBookDetail',
    async (bookId: string, { rejectWithValue }) => {
        try {
            const response = await apiGetBookDetail<Book>(bookId)
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data)
            }
            return rejectWithValue({ detail: "An unknown error occurred." })
        }
    }
)

const initialState: BookState = {
    bookLoading: false,
    detailLoading: false,
    booksData: [],
    subjectsData: [],
    bookDetail: null,
    error: null,
    notification: null,
}

const bookSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        resetError: (state) => {
            state.error = null
        },
        resetNotifaction: (state) => {
            state.notification = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getBooksData.fulfilled, (state, action) => {
                state.booksData = action.payload.books
                state.subjectsData = action.payload.subjects
                state.bookLoading = false
            })
            .addCase(getBooksData.pending, (state) => {
                state.bookLoading = true
            })
            .addCase(getBooksData.rejected, (state, action) => {
                state.bookLoading = false
                state.notification = { type: 'danger', message: 'Ooop! Please try after sometime.' }
            })
            .addCase(getBookDetail.fulfilled, (state, action) => {
                state.bookDetail = action.payload;
                state.detailLoading = false;
            })
            .addCase(getBookDetail.pending, (state) => {
                state.detailLoading = true;
            })
            .addCase(getBookDetail.rejected, (state, action) => {
                state.error = (action.payload as { detail: string }).detail
                state.notification = { type: 'danger', message: 'Ooop! Please try after sometime.' }
                state.detailLoading = false;
            });
    },
})

export const { resetError, resetNotifaction } = bookSlice.actions

export default bookSlice.reducer