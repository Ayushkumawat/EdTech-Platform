from langchain_community.vectorstores import Qdrant
import qdrant_client
from langchain_community.embeddings import HuggingFaceEmbeddings
from fastapi import status, HTTPException
embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-base-zh-v1.5")

# Initialize Qdrant client and vector store
client = qdrant_client.QdrantClient(
    url="https://22947d07-2eb1-420a-8811-be91e3977516.europe-west3-0.gcp.cloud.qdrant.io",
    api_key="9wUhkYzPMtlCZ42PkCRxHmdnZk6Crc9zqLNJmh4xoowsjThofM0xcA",
    check_compatibility=False
)

# Vector configuration
vector_config = qdrant_client.http.models.VectorParams(
    size=768,
    distance=qdrant_client.http.models.Distance.COSINE
)

class qdrant_store:

    def initilize_course_store(self,course_name):
            collection_name = course_name
            if client.collection_exists(collection_name.lower())==False:
                client.create_collection(
                    collection_name=collection_name,
                    vectors_config=vector_config
                )
            else:
                  raise HTTPException(detail="store already present", status_code=status.HTTP_403_FORBIDDEN)
                  

    def get_course_store(self,course_name):

            store = Qdrant(
                client=client,
                collection_name=course_name,
                embeddings=embeddings
            )
            if (client.get_collection(course_name).__dict__)["points_count"]==0:
                  raise HTTPException(detail="collection is empty", status_code=status.HTTP_403_FORBIDDEN)
                  
            
            return store