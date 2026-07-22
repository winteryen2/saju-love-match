# Saju Love Match 💘

유사연애 덕질 사용자를 위한 아이돌 사주 연애 궁합 웹앱입니다.

## 파일

- `index.html`: 화면 + 사주 계산 + Love Match 점수 계산
- `idols.json`: 아이돌 데이터

## GitHub Pages 배포

1. 이 저장소에 `index.html`, `idols.json`을 업로드합니다.
2. GitHub 웹에서 `Settings → Pages`
3. `Deploy from a branch`
4. `main / (root)` 선택 후 저장
5. 잠시 뒤 `https://내아이디.github.io/saju-love-match/`로 접속합니다.

> GitHub 앱에서는 Pages 설정이 잘 보이지 않을 수 있으므로 Safari에서 GitHub 웹사이트를 여는 것이 편합니다.

## 데이터 추가

`idols.json` 배열 안에 아래 형식으로 추가하세요.

```json
{
  "name": "강유찬",
  "group": "A.C.E",
  "agency": "기타",
  "gender": "M",
  "dob": "1997-12-31",
  "cat": "K-idol"
}
```

- `gender`: 남성 `M`, 여성 `F`
- `dob`: `YYYY-MM-DD`
- 마지막 항목을 제외하고 각 객체 뒤에 쉼표가 필요합니다.

## 점수 비중

- 연애 십신 35%
- 일지 궁합 20%
- 천간합 15%
- 오행 밸런스 15%
- 신강·신약 보완 10%
- 시주 궁합 5%

종합 순위와 함께 설렘·안정 점수도 표시합니다.

## 주의

명리 요소를 유사연애 콘셉트로 재구성한 오락용 모델입니다. 실제 연애 관계를 예측하거나 보증하지 않습니다.
