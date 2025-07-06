import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiGetBooks,apiGetBookDetail,apiGetPurchasedBookDetail } from '@/services/BooksServices'
import { apiGetPurchasedBooks,apiPostPurchasedBook } from '@/services/BooksServices'
import type { CommonProps, TypeAttributes } from '@/components/ui/@types/common'
import { Action } from 'history';
import { useNavigate } from 'react-router-dom'
import { APP_PREFIX_PATH } from '@/constants/route.constant'



export type Lesson = {
    uid: string; // UUID as a string
    title: string; // UUID as a string
    description:string;
    md:string;
    
  };
  
  // Define BookObject type
  export type BookObject = {
    uid: string; // UUID as a string
    title: string;
    total_lessons:number; // Array of Lesson objects
    duration: string; // Specify the format if required (e.g., ISO 8601 duration)
    total_enrollments: number;
    cost:number;
    category:string;
    created_at: Date; // JavaScript Date object
    updated_at: Date; // JavaScript Date object
};

  export type BookDetailObject={
    title: string;
    total_lessons:number; // Array of Lesson objects
    duration: string; // Specify the format if required (e.g., ISO 8601 duration)
    total_enrollments: number;
    description: string;
    category:string;
    teacher:string;
    cost:number;
    book_lessons: Array<Lesson>;

  }

type AllBooksData = BookObject[]

type BooksDetailData = BookDetailObject
export type BookState = {
    loading: boolean;
    booksData: any;
    purchasesBooksData: any; // Corrected this line
    bookDetail: any;
    error: any;
    dialog:boolean;
    purchasedBookDetail:any
    notification:Notification | null;
};

type GetBooksDataResponse = AllBooksData
type GetBookDetailResopnse=BooksDetailData
type GetPurchasedDataResopnse={ [key: string]: BookObject }[]
type Notification = {
    type: TypeAttributes.Status,
    message: string
}

export const SLICE_NAME = 'books'

export const getBooksData = createAsyncThunk(
    SLICE_NAME + '/getBooksData',
    async () => {
        const response = await apiGetBooks<GetBooksDataResponse>()
        
        return response.data;
    }
)

export const getPurchasedBookData = createAsyncThunk(
    SLICE_NAME + '/getPurchasedBookData',
    async () => {
        const response = await apiGetPurchasedBooks<GetPurchasedDataResopnse>()
        
        return response.data;
    }
)

export const getBookDetail = createAsyncThunk(
    SLICE_NAME + '/getBookDetail',
    async (bookId: string,{rejectWithValue}) => {
        try {
        const response = await apiGetBookDetail<GetBookDetailResopnse>(bookId)
        
        return response.data;
    } catch (error: any) {
        // Forward the error response from the server
        if (error.response && error.response.data) {
            
            return rejectWithValue(error.response.data); // Send the server error response
        }
        return rejectWithValue({ detail: "An unknown error occurred." }); // Fallback
    }
    }
)

export const getPurchasedBookDetail = createAsyncThunk(
    SLICE_NAME + '/getPurchasedBookDetail',
    async (bookId: string, { rejectWithValue }) => {
        try {
            const response = await apiGetPurchasedBookDetail<any>(bookId);
            return response.data;
        } catch (error: any) {
            // Forward the error response from the server
            if (error.response && error.response.data) {
                
                return rejectWithValue(error.response.data); // Send the server error response
            }
            return rejectWithValue({ detail: "An unknown error occurred." }); // Fallback
        }
    }
);

export const addPurchasedBookData = createAsyncThunk(
    SLICE_NAME + '/addPurchasedBookData',
    async (bookId: string) => {
        const response:any = await apiPostPurchasedBook<GetBookDetailResopnse>(bookId)
        
        return response.data.bookpurchase_book;
    }
)

const initialState: BookState = {
    loading: false,
    booksData: [],
    purchasesBooksData:[],
    bookDetail:null,
    purchasedBookDetail:null,
    error:null,
    dialog:false,
    notification: null,
  
}

const bookSlice = createSlice({
    name: `books`,
    initialState,
    reducers: {
     
        setBooksData: (state, action) => {
            state.booksData = action.payload
        },
        findBookById: (state, action) => {
            const bookId = action.payload;
            console.log(state.booksData)
            const foundBook = state.booksData.find((book:any) => book.uid == bookId);
            if (foundBook) {
                state.bookDetail = foundBook;
                state.error = null;
            } else {
                state.bookDetail = null;
                state.error = `Book with ID ${bookId} not found.`;
            }
        },
        setDialogBox:(state,action)=>{
            state.dialog = action.payload

        },
        resetError:(state)=>{
            state.error = null

        }
        
    },
    extraReducers: (builder) => {
        builder
            .addCase(getBooksData.fulfilled, (state, action) => {
                state.booksData = action.payload
                state.loading = false
                
                
                
            })
            .addCase(getBooksData.pending, (state) => {
                state.loading = true
            })
            .addCase(getBooksData.rejected, (state, action) => {
                state.loading = false
                state.notification = { type: 'danger', message: 'Ooop! Please try after sometime.' }
            })
            .addCase(getPurchasedBookData.fulfilled, (state, action) => {
                state.purchasesBooksData = action.payload.map((item:any) => item.bookpurchase_book)
                state.loading = false
            })
            .addCase(getPurchasedBookData.pending, (state) => {
                state.loading = true
            })
            .addCase(getPurchasedBookData.rejected, (state, action) => {
                state.loading = false
                state.notification = { type: 'danger', message: 'Ooop! Please try after sometime.' }
            })
            .addCase(getPurchasedBookDetail.fulfilled, (state,action) => {
                state.loading = false
                
                state.purchasedBookDetail = action.payload
                
            })
            .addCase(getPurchasedBookDetail.pending, (state) => {
                state.loading = true
             
            })
            .addCase(getPurchasedBookDetail.rejected, (state,action) => {
          
                state.loading = false
                state.error=action.payload.detail
                state.notification = { type: 'danger', message: 'Ooop! Please try after sometime.' }
            })
            .addCase(addPurchasedBookData.fulfilled, (state, action) => {
                state.purchasesBooksData = [...state.purchasesBooksData, action.payload]
                state.dialog=true
                state.loading = false
            })
            .addCase(addPurchasedBookData.pending, (state) => {
                state.loading = true
            })
            .addCase(addPurchasedBookData.rejected, (state, action) => {
                console.log(action.payload)
                state.notification = { type: 'danger', message: 'Ooop! Please try after sometime.' }
            })
            .addCase(getBookDetail.fulfilled, (state, action) => {
                state.bookDetail = action.payload; // Store the fetched book detail
                state.loading = false;
            })
            .addCase(getBookDetail.pending, (state) => {
                state.loading = true;
            })
            .addCase(getBookDetail.rejected, (state, action) => {
                console.log(action.payload,"error")
                state.loading = false
                state.error=action.payload.detail
                state.notification = { type: 'danger', message: 'Ooop! Please try after sometime.' }
            });

    },
})

export const { setBooksData,findBookById,setDialogBox,resetError} = bookSlice.actions

export default bookSlice.reducer
