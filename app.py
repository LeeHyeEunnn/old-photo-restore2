import os
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import cloudinary
import cloudinary.uploader

app = Flask(__name__)
CORS(app)

# 💡 여기에 Cloudinary 대시보드에서 본인의 정보를 입력하세요.
cloudinary.config( 
  cloud_name = "dzp2mydvb", 
  api_key = "661642541586556", 
  api_secret = "-BblC0dGh4wBJneHcjmsfDDvjTw",
  secure = True
)

@app.route('/restore', methods=['POST'])
def restore_image():
    temp_path = None
    try:
        print("\n=== 📥 Cloudinary 업로드 및 보정 시작 ===")
        if 'image' not in request.files:
            return jsonify({"error": "이미지가 없습니다."}), 400

        file = request.files['image']
        temp_path = f"temp_{file.filename}"
        file.save(temp_path)

        # 1. Cloudinary에 이미지 업로드 및 AI 보정 적용
        # e_improve: 자동 색상/대조 보정, e_sharpen: 선명도 향상
        print("[2단계] 이미지 업로드 중...")
        upload_result = cloudinary.uploader.upload(
            temp_path,
            transformation=[
                {'effect': "improve"},   # 전체적인 화질 개선
                {'effect': "sharpen:100"}, # 선명도 최대치
                {'quality': "auto"},     # 최적 화질 자동 설정
                {'fetch_format': "auto"} # 최적 포맷 자동 설정
            ]
        )
        
        # 2. 보정된 이미지 URL 추출
        restored_url = upload_result.get("secure_url")
        print(f"[3단계] 보정 완료! 결과 URL: {restored_url}")
        
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        return jsonify({"imageUrl": restored_url})

    except Exception as e:
        print("\n🚨 에러 발생!")
        print(traceback.format_exc())
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)