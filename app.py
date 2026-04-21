import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import replicate

app = Flask(__name__)
CORS(app) # HTML 파일과 서버의 포트가 달라도 통신할 수 있게 허용

# 발급받은 API 키를 여기에 입력하세요
os.environ["REPLICATE_API_TOKEN"] = "개인 API 키 입력"

@app.route('/restore', methods=['POST'])
def restore_image():
    if 'image' not in request.files:
        return jsonify({"error": "이미지가 없습니다."}), 400

    file = request.files['image']
    
    # 1. 업로드된 이미지를 서버에 임시 저장
    temp_path = f"temp_{file.filename}"
    file.save(temp_path)

    try:
        # 2. Replicate API를 통해 GFPGAN 모델(얼굴 복원) 호출
        print("AI 복원 진행 중...")
        output = replicate.run(
            "tencentarc/gfpgan:9283608c6d336162ab3e898a54d5d5fa40317e04df7ba00f16bb1fa33f67f654",
            input={"img": open(temp_path, "rb")}
        )
        
        # 3. AI가 반환한 결과 이미지 URL 확인
        result_image_url = output
        
        # 임시 파일 삭제
        os.remove(temp_path)
        
        # 4. 프론트엔드로 결과 URL 전달
        return jsonify({"imageUrl": result_image_url})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Flask 서버 실행 (기본 포트 5000번)
    app.run(port=5000, debug=True)