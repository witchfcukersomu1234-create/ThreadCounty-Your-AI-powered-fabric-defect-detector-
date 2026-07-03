print("USING backend/api/analyze.py")
from fastapi import APIRouter, HTTPException, UploadFile, File
import time

from services.yolo_service import yolo_service
from services.gemini_service import gemini_service

router = APIRouter()


@router.post("/")
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyze uploaded image using YOLOv8 and Gemini
    """

    try:

        file_content = await file.read()

        if not file_content:
            raise HTTPException(
                status_code=400,
                detail="File is empty"
            )

        mime_type = file.content_type or "image/jpeg"

        if not mime_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="File must be an image"
            )

        start_time = time.time()

        print("========== STEP 1 ==========")

        result = await yolo_service.analyze_image(
            file_content,
            mime_type
        )

        print(result)

        if result.get("status") == "success":

            print("========== STEP 2 ==========")

            ai_summary = await gemini_service.generate_summary(
                result["detections"],
                result["total_defects"],
                result["processing_time"]
            ) or "AI summary could not be generated."

            print("========== GEMINI RESULT ==========")
            print(ai_summary)

            result["ai_summary"] = ai_summary

            print("========== STEP 3 ==========")

        result["total_time"] = round(
            time.time() - start_time,
            3
        )

        print("========== FINAL RESPONSE ==========")
        print(result)

        return result

    except HTTPException:
        raise

    except Exception as e:
        import traceback

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
