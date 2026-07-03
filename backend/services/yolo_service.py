from ultralytics import YOLO
from pathlib import Path
from PIL import Image
import io
import time
import traceback


class YOLOService:

    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):

        if self._model is not None:
            return

        current_dir = Path(__file__).resolve().parent

        # backend/services
        #        ↑
        # backend/app/models/best.pt

        self.model_path = current_dir.parent / "app" / "models" / "best.pt"

        print("=" * 60)
        print("ThreadCounty YOLO Initializing")
        print("Model Path:")
        print(self.model_path)
        print("=" * 60)

        self.load_model()

    def load_model(self):

        if not self.model_path.exists():

            raise FileNotFoundError(
                f"\nModel not found:\n{self.model_path}\n"
            )

        self._model = YOLO(str(self.model_path))

        print("\nYOLO Model Loaded Successfully")
        print("Classes:")
        print(self._model.names)
        print("=" * 60)

    async def analyze_image(self, image_data: bytes, mime_type: str):

        try:

            image = Image.open(io.BytesIO(image_data))

            if image.mode != "RGB":
                image = image.convert("RGB")

            start = time.time()

            results = self._model.predict(
                source=image,
                conf=0.25,
                verbose=False
            )

            detections = []

            for result in results:

                if result.boxes is None:
                    continue

                for box in result.boxes:

                    cls = int(box.cls[0])

                    conf = float(box.conf[0])

                    x1, y1, x2, y2 = box.xyxy[0].tolist()

                    detections.append({

                        "class": self._model.names[cls],

                        "confidence": round(conf,3),

                        "bbox":[
                            round(x1,2),
                            round(y1,2),
                            round(x2,2),
                            round(y2,2)
                        ]

                    })

            return{

                "status":"success",

                "detections":detections,

                "total_defects":len(detections),

                "processing_time":round(time.time()-start,3)

            }

        except Exception:

            traceback.print_exc()

            return{

                "status":"error",

                "message":traceback.format_exc()

            }


yolo_service = YOLOService()