# Orbit Post Alpha 0.1 — Render Edition

Descent식 6DOF 비행을 핵심으로 다시 만든 첫 vertical slice입니다.

## Render 배포
1. 이 폴더 전체를 GitHub `orbit-post` 저장소에 업로드
2. Render에서 Blueprint 생성
3. 저장소 연결
4. `render.yaml` 자동 인식 후 Deploy

`render.yaml`은 Render 무료 플랜(`plan: free`)으로 설정되어 있습니다. 무료 웹 서비스는 일정 시간 요청이 없으면 절전되므로, 절전 후 첫 접속은 시작 시간만큼 늦을 수 있습니다.

## 로컬 실행
```bash
pip install -r requirements.txt
uvicorn server:app --reload
```
브라우저에서 http://127.0.0.1:8000 · 상태 확인 `GET /healthz` (Render health check 경로)

정적 파일은 `Cache-Control: no-cache`로 제공되므로, 배포 직후에도 브라우저가 새 `game.js`를 확인합니다(바뀌지 않았으면 304).

3D 엔진(three.js 0.180.0)은 jsDelivr CDN에서 불러오므로 실행 중 인터넷 연결이 필요합니다.

## 검증
```bash
pip install -r requirements-dev.txt
python -m pytest -q
node --check static/game.js
```
GitHub Actions(`.github/workflows/ci.yml`)가 PR과 main 푸시마다 같은 검사를 실행합니다.

## 플레이
W/S 전후 추력, A/D 좌우, Q/E 롤, 마우스 Pitch/Yaw, Shift Boost, Space Brake, R 재시작(임무 완료·기체 손실 후).
ESC로 마우스 잠금을 풀면 비행이 일시정지되고, 화면을 클릭하면 이어서 비행합니다.

회전은 기체 기준 축으로 누적되므로 롤한 상태에서도 마우스 Pitch/Yaw가 조종석 기준으로 동작합니다.
정거장 외벽, 서비스 터널 벽, 회전 팬은 충돌체이며 충돌 속도의 제곱에 비례해 선체가 손상됩니다.
Dock 03은 Intercept Gate 5개를 통과한 뒤 도킹 베이 바로 앞(약 0.3 m 이내)에서 정렬·감속(5 m/s 미만)했을 때만 열립니다.

## Vertical Slice
격납고 출항 → Intercept Gates → 수동 접근 → Dock 03 → 서비스 터널 → 회전 팬 → 냉각펌프 전달 → 온실 전력 복구.

Python/FastAPI는 이후 궤도계산, NPC 물류망, 계약·경제 시뮬레이션 서버로 확장하기 위한 기반입니다.
