# Orbit Post Alpha 0.1 — Render Edition

Descent식 6DOF 비행을 핵심으로 다시 만든 첫 vertical slice입니다.

## Render 배포
1. 이 폴더 전체를 GitHub `orbit-post` 저장소에 업로드
2. Render에서 Blueprint 생성
3. 저장소 연결
4. `render.yaml` 자동 인식 후 Deploy

## 로컬 실행
```bash
pip install -r requirements.txt
uvicorn server:app --reload
```
브라우저에서 http://127.0.0.1:8000

## 플레이
W/S 전후 추력, A/D 좌우, Q/E 롤, 마우스 Pitch/Yaw, Shift Boost, Space Brake.

## Vertical Slice
격납고 출항 → Intercept Gates → 수동 접근 → Dock 03 → 서비스 터널 → 회전 팬 → 냉각펌프 전달 → 온실 전력 복구.

Python/FastAPI는 이후 궤도계산, NPC 물류망, 계약·경제 시뮬레이션 서버로 확장하기 위한 기반입니다.
