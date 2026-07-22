# Saju Love Match 💘

유사연애 덕질 사용자를 위한 **아이돌 사주 연애 궁합 웹앱**입니다.

생년월일과 태어난 시각을 입력하면 각 인물과의 궁합을 아래 항목으로 계산합니다.

| 항목 | 비중 |
|---|---:|
| 연애 십신 | 35% |
| 일지 궁합 | 20% |
| 천간합 | 15% |
| 오행 밸런스 | 15% |
| 신강·신약 보완 | 10% |
| 시주 궁합 | 5% |

결과에는 **설렘 / 안정 / 종합 LOVE MATCH** 점수가 함께 표시됩니다.

## 프로젝트 구조

```text
saju-love-match/
├── index.html
├── idols.json
├── README.md
├── LICENSE
├── docs/
│   ├── SCORING.md
│   └── DATA.md
└── tools/
    ├── validate.js
    └── README.md
```

## GitHub에 올리는 방법

1. 이 ZIP을 내려받아 아이폰 파일 앱에서 압축을 풉니다.
2. Safari에서 GitHub 저장소를 엽니다.
3. `Add file → Upload files`
4. 압축을 푼 폴더 **안의 파일과 폴더 전체**를 업로드합니다.
5. `Commit changes`를 누릅니다.
6. 저장소의 `Settings → Pages`
7. `Deploy from a branch`
8. `main / (root)` 선택 후 저장합니다.

배포 주소:

```text
https://내깃허브아이디.github.io/saju-love-match/
```

## 아이돌 추가

`idols.json`에 아래 형식으로 추가합니다.

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

자세한 내용은 [`docs/DATA.md`](docs/DATA.md)를 참고하세요.

## 데이터 검사

컴퓨터 또는 GitHub Codespaces에서:

```bash
node tools/validate.js
```

오류가 없으면 다음처럼 표시됩니다.

```text
Validation passed: 5 records
```

## 주의

이 프로젝트는 전통 명리 요소를 유사연애 콘셉트에 맞게 재구성한 **오락용 웹앱**입니다.
과학적 예측이나 실제 관계의 보증이 아닙니다.
