export interface ShelfLifeInfo {
  days: number           // 보관 가능 일수
  storage: '냉장' | '냉동' | '실온'
  warningDays: number    // 이 일수 이하 남으면 ⚠️ 경고
  spoilageSign: string   // 버려야 할 신호
  tip?: string           // 보관 팁
}

// 재료명 기준 유통기한 데이터
export const SHELF_LIFE: Record<string, ShelfLifeInfo> = {

  // ───── 채소 ─────
  '양파': {
    days: 60, storage: '실온', warningDays: 14,
    spoilageSign: '껍질이 물러지거나 안쪽까지 검게 변하면, 곰팡이가 피면 버리세요',
    tip: '서늘하고 어두운 곳에 망에 걸어 보관. 감자와 따로 보관하세요',
  },
  '마늘': {
    days: 30, storage: '냉장', warningDays: 7,
    spoilageSign: '초록 싹이 많이 자라거나 물러지고 검게 변하면 버리세요',
    tip: '껍질 깐 마늘은 냉장, 통마늘은 통풍되는 곳에 보관',
  },
  '대파': {
    days: 10, storage: '냉장', warningDays: 3,
    spoilageSign: '끝이 노랗게 변하거나 물러지고 끈적해지면 버리세요',
    tip: '키친타월로 감싸 세워서 냉장 보관하면 더 오래 가요',
  },
  '당근': {
    days: 21, storage: '냉장', warningDays: 5,
    spoilageSign: '표면이 물렁물렁하거나 검은 반점이 생기면 버리세요',
    tip: '잎 부분을 잘라내고 신문지에 감싸 냉장 보관',
  },
  '감자': {
    days: 30, storage: '실온', warningDays: 7,
    spoilageSign: '초록빛으로 변하거나 물러지면 버리세요 (초록 부분엔 독성 있음)',
    tip: '어둡고 서늘한 곳에. 사과와 함께 보관하면 싹이 덜 나요',
  },
  '고추': {
    days: 7, storage: '냉장', warningDays: 2,
    spoilageSign: '물러지거나 곰팡이가 피면 버리세요',
    tip: '꼭지를 위로 하여 밀폐용기에 보관',
  },
  '애호박': {
    days: 5, storage: '냉장', warningDays: 2,
    spoilageSign: '표면이 물렁해지거나 안쪽이 스펀지처럼 변하면 버리세요',
    tip: '자른 경우 랩으로 밀봉해서 2~3일 내 사용',
  },
  '시금치': {
    days: 4, storage: '냉장', warningDays: 1,
    spoilageSign: '노랗게 변색되거나 끈적이고 냄새가 나면 버리세요',
    tip: '물기 없이 키친타월에 감싸 냉장. 가능하면 당일 사용 권장',
  },
  '배추': {
    days: 10, storage: '냉장', warningDays: 3,
    spoilageSign: '잎이 노랗게 변하거나 냄새가 심해지면 버리세요',
    tip: '자른 단면을 랩으로 밀봉하거나 비닐에 넣어 냉장 보관',
  },
  '버섯': {
    days: 5, storage: '냉장', warningDays: 2,
    spoilageSign: '표면이 검게 변하거나 점액질이 생기고 이상한 냄새가 나면 버리세요',
    tip: '종이 봉지에 넣어 냉장 보관. 밀폐하면 더 빨리 상해요',
  },
  '토마토': {
    days: 7, storage: '실온', warningDays: 2,
    spoilageSign: '지나치게 물러지거나 곰팡이가 피면 버리세요',
    tip: '냉장 보관 시 맛이 떨어져요. 실온에서 꼭지 아래로 뒤집어 보관',
  },
  '브로콜리': {
    days: 5, storage: '냉장', warningDays: 2,
    spoilageSign: '꽃봉오리가 노랗게 변하거나 물러지면 버리세요',
    tip: '흐르는 물에 씻어 물기 제거 후 밀폐 보관',
  },
  '콩나물': {
    days: 4, storage: '냉장', warningDays: 1,
    spoilageSign: '끝이 검게 변하거나 냄새가 심해지면 버리세요',
    tip: '물에 담가 냉장 보관하고 매일 물을 교체하세요',
  },
  '두부': {
    days: 4, storage: '냉장', warningDays: 1,
    spoilageSign: '신맛이 나거나 표면이 끈적이거나 노랗게 변하면 버리세요',
    tip: '개봉 후 물에 담가 냉장 보관, 매일 물 교체',
  },
  '깻잎': {
    days: 5, storage: '냉장', warningDays: 2,
    spoilageSign: '잎이 검게 변하거나 끈적이면 버리세요',
    tip: '줄기를 물에 담가 세워서 냉장 보관',
  },
  '부추': {
    days: 5, storage: '냉장', warningDays: 2,
    spoilageSign: '잎이 노랗게 변하거나 끈적이면 버리세요',
    tip: '키친타월에 감싸 밀폐용기에 넣어 냉장 보관',
  },
  '파프리카': {
    days: 10, storage: '냉장', warningDays: 3,
    spoilageSign: '표면이 물러지거나 곰팡이가 피면 버리세요',
    tip: '자른 경우 랩으로 밀봉, 3~5일 내 사용 권장',
  },
  '양상추': {
    days: 7, storage: '냉장', warningDays: 2,
    spoilageSign: '잎이 갈색으로 변하거나 물러지면 버리세요',
    tip: '키친타월로 싸서 비닐에 넣어 냉장 보관',
  },
  '오이': {
    days: 7, storage: '냉장', warningDays: 2,
    spoilageSign: '표면이 물러지거나 끈적이면 버리세요',
    tip: '세워서 보관하거나 키친타월에 감싸 보관',
  },
  '가지': {
    days: 7, storage: '냉장', warningDays: 2,
    spoilageSign: '표면이 쭈글쭈글하거나 갈색으로 변하면 버리세요',
    tip: '씻지 않고 비닐에 넣어 냉장 보관. 저온에 약해 10°C 이상이 좋아요',
  },
  '단호박': {
    days: 60, storage: '실온', warningDays: 14,
    spoilageSign: '잘린 부분이 썩거나 곰팡이가 피면 버리세요 (자른 것은 냉장 3~5일)',
    tip: '통째로는 서늘한 실온 보관. 자른 것은 씨 제거 후 랩으로 밀봉해서 냉장',
  },
  '무': {
    days: 14, storage: '냉장', warningDays: 4,
    spoilageSign: '물러지거나 속이 스펀지처럼 변하면 버리세요',
    tip: '잎 부분을 잘라내고 키친타월로 감싸 냉장 보관',
  },
  '팽이버섯': {
    days: 5, storage: '냉장', warningDays: 2,
    spoilageSign: '갈색으로 변하거나 점액질이 생기면 버리세요',
    tip: '포장째 냉장 보관. 개봉 후 키친타월에 싸서 보관',
  },
  '느타리버섯': {
    days: 5, storage: '냉장', warningDays: 2,
    spoilageSign: '검게 변하거나 물기가 많아지고 냄새가 나면 버리세요',
    tip: '종이백에 넣어 냉장 보관. 씻지 않고 보관',
  },
  '표고버섯': {
    days: 10, storage: '냉장', warningDays: 3,
    spoilageSign: '갓 뒷면이 검어지거나 표면이 끈적이면 버리세요',
    tip: '종이 봉지에 넣어 냉장. 말린 표고버섯은 실온 1년 보관 가능',
  },
  '옥수수': {
    days: 3, storage: '냉장', warningDays: 1,
    spoilageSign: '낟알이 시들거나 냄새가 나면 버리세요',
    tip: '껍질째 냉장. 삶은 옥수수는 2일 내 먹는 것이 좋아요',
  },
  '피망': {
    days: 10, storage: '냉장', warningDays: 3,
    spoilageSign: '표면이 주름지거나 물러지고 곰팡이가 피면 버리세요',
    tip: '씻지 않고 비닐에 넣어 냉장 보관',
  },
  '쑥갓': {
    days: 4, storage: '냉장', warningDays: 1,
    spoilageSign: '잎이 시들거나 노랗게 변하고 냄새가 나면 버리세요',
    tip: '줄기를 물에 담가 세워서 냉장 보관',
  },
  '고구마': {
    days: 30, storage: '실온', warningDays: 7,
    spoilageSign: '검게 썩거나 곰팡이가 피면 버리세요',
    tip: '신문지에 하나씩 싸서 서늘하고 어두운 곳에 보관. 냉장하면 더 빨리 상해요',
  },

  // ───── 육류·달걀 ─────
  '닭가슴살': {
    days: 2, storage: '냉장', warningDays: 1,
    spoilageSign: '회색/갈색으로 변색되거나 이상한 냄새가 나면 즉시 버리세요',
    tip: '당일 구매 후 바로 냉동하거나 2일 내 사용 권장',
  },
  '돼지고기': {
    days: 4, storage: '냉장', warningDays: 1,
    spoilageSign: '회색으로 변색되거나 신 냄새가 나면 즉시 버리세요',
    tip: '비닐에 밀봉하여 냉장. 3일 이상 보관 시 냉동 권장',
  },
  '소고기': {
    days: 4, storage: '냉장', warningDays: 1,
    spoilageSign: '갈색/회색으로 변하거나 냄새가 이상하면 즉시 버리세요',
    tip: '랩으로 밀봉 냉장. 자른 단면이 공기에 닿으면 빨리 상해요',
  },
  '달걀': {
    days: 30, storage: '냉장', warningDays: 7,
    spoilageSign: '물에 넣었을 때 뜨면 상한 것. 깨뜨렸을 때 이상한 냄새가 나면 버리세요',
    tip: '뾰족한 쪽이 아래를 향하게 냉장. 냄새 흡수하므로 밀폐용기에 보관',
  },
  '삼겹살': {
    days: 4, storage: '냉장', warningDays: 1,
    spoilageSign: '회색으로 변색되거나 신 냄새가 나면 즉시 버리세요',
    tip: '비닐에 밀봉하여 냉장. 3일 이상 보관 시 냉동 권장',
  },
  '닭다리살': {
    days: 2, storage: '냉장', warningDays: 1,
    spoilageSign: '회색/갈색으로 변색되거나 이상한 냄새가 나면 즉시 버리세요',
    tip: '당일 구매 후 바로 냉동하거나 2일 내 사용 권장',
  },
  '베이컨': {
    days: 7, storage: '냉장', warningDays: 2,
    spoilageSign: '색이 회색으로 변하거나 끈적이고 신 냄새가 나면 버리세요',
    tip: '개봉 후 랩으로 밀봉. 한 번에 다 쓰기 어려우면 1회분씩 나눠 냉동',
  },
  '소시지': {
    days: 7, storage: '냉장', warningDays: 2,
    spoilageSign: '색이 변하거나 끈적이고 냄새가 이상하면 버리세요',
    tip: '개봉 후 밀폐용기에 보관. 1주일 내 소비 권장',
  },
  '햄': {
    days: 5, storage: '냉장', warningDays: 2,
    spoilageSign: '끈적이거나 신맛/이상한 냄새가 나면 버리세요',
    tip: '개봉 후 단면을 랩으로 밀봉하거나 밀폐용기에 보관',
  },
  '닭안심': {
    days: 2, storage: '냉장', warningDays: 1,
    spoilageSign: '회색/갈색으로 변색되거나 이상한 냄새가 나면 즉시 버리세요',
    tip: '당일 구매 후 바로 냉동하거나 2일 내 사용 권장',
  },

  // ───── 해산물 ─────
  '새우': {
    days: 2, storage: '냉장', warningDays: 1,
    spoilageSign: '껍질이 검게 변하거나 비린내가 강해지면 버리세요',
    tip: '당일 구매 시 바로 냉동 권장. 해동 후 재냉동 금지',
  },
  '오징어': {
    days: 2, storage: '냉장', warningDays: 1,
    spoilageSign: '색이 분홍/갈색으로 변하거나 강한 냄새가 나면 버리세요',
    tip: '내장 제거 후 깨끗이 씻어 밀봉 냉장 또는 냉동',
  },
  '참치캔': {
    days: 1095, storage: '실온', warningDays: 30,
    spoilageSign: '캔이 부풀거나 개봉 시 이상한 냄새가 나면 버리세요 (개봉 후 2일 내 소비)',
    tip: '개봉 후 남은 것은 반드시 다른 용기에 옮겨 냉장 보관',
  },
  '멸치': {
    days: 180, storage: '냉장', warningDays: 30,
    spoilageSign: '비린내가 강해지거나 기름이 산패되면 버리세요',
    tip: '밀폐용기에 넣어 냉장. 대량이면 냉동 보관 권장',
  },
  '고등어': {
    days: 2, storage: '냉장', warningDays: 1,
    spoilageSign: '눈이 탁해지거나 아가미가 갈색으로 변하고 냄새가 나면 버리세요',
    tip: '내장을 제거하고 소금을 살짝 뿌려 밀봉 냉장',
  },
  '꽁치': {
    days: 2, storage: '냉장', warningDays: 1,
    spoilageSign: '색이 변하거나 강한 비린내가 나면 버리세요',
    tip: '내장 제거 후 밀봉하여 냉장. 당일 사용 권장',
  },
  '조개': {
    days: 2, storage: '냉장', warningDays: 1,
    spoilageSign: '껍데기가 열려 있고 두드려도 닫히지 않으면 버리세요. 이상한 냄새도 주의',
    tip: '소금물에 해감 후 냉장. 가능하면 당일 사용 권장',
  },
  '김': {
    days: 90, storage: '실온', warningDays: 14,
    spoilageSign: '눅눅해지거나 이상한 냄새가 나면 버리세요',
    tip: '밀폐용기에 건조제와 함께 보관. 냉동 보관 시 1년까지 가능',
  },
  '미역': {
    days: 365, storage: '실온', warningDays: 30,
    spoilageSign: '곰팡이가 피거나 이상한 냄새가 나면 버리세요 (불린 것은 냉장 2일)',
    tip: '건조 상태로 밀폐용기에 보관. 불린 미역은 2일 내 소비',
  },
  '게맛살': {
    days: 5, storage: '냉장', warningDays: 2,
    spoilageSign: '냄새가 이상하거나 색이 변하면 버리세요',
    tip: '개봉 후 랩으로 밀봉하여 냉장 보관',
  },
  '굴': {
    days: 2, storage: '냉장', warningDays: 1,
    spoilageSign: '냄새가 이상하거나 색이 탁해지면 버리세요',
    tip: '당일 구매 후 바로 소비 권장. 소금물에 살짝 씻어 보관',
  },

  // ───── 유제품 ─────
  '우유': {
    days: 7, storage: '냉장', warningDays: 2,
    spoilageSign: '신맛이 나거나 응고되면 버리세요',
    tip: '문쪽 선반보다 안쪽이 온도가 일정해서 더 오래 가요',
  },
  '치즈': {
    days: 10, storage: '냉장', warningDays: 3,
    spoilageSign: '곰팡이가 생기거나 이상한 냄새가 나면 버리세요',
    tip: '랩으로 밀봉하거나 밀폐용기에 보관',
  },
  '요거트': {
    days: 7, storage: '냉장', warningDays: 2,
    spoilageSign: '액체가 많이 분리되거나 신맛이 너무 강해지고 곰팡이가 피면 버리세요',
    tip: '개봉 후 밀폐하여 냉장. 뚜껑에 이슬이 맺히면 빨리 먹어야 해요',
  },
  '버터': {
    days: 30, storage: '냉장', warningDays: 7,
    spoilageSign: '기름이 산패되어 쓴맛/이상한 냄새가 나면 버리세요',
    tip: '빛과 공기를 차단해 밀봉 냉장. 냉동 시 3개월까지 가능',
  },
  '두유': {
    days: 7, storage: '냉장', warningDays: 2,
    spoilageSign: '신맛이 나거나 응고되면 버리세요',
    tip: '개봉 후 밀폐하여 냉장. 개봉 전 실온 보관 가능',
  },

  // ───── 곡류 ─────
  '쌀': {
    days: 180, storage: '실온', warningDays: 30,
    spoilageSign: '냄새가 나거나 벌레가 생기면 버리세요',
    tip: '밀폐용기에 넣어 서늘한 곳에. 여름엔 냉장 보관 권장',
  },
  '면': {
    days: 365, storage: '실온', warningDays: 30,
    spoilageSign: '냄새가 나거나 벌레가 생기면 버리세요 (생면은 냉장 3~5일)',
    tip: '건면은 밀폐용기에 실온 보관',
  },
  '빵': {
    days: 5, storage: '실온', warningDays: 2,
    spoilageSign: '곰팡이가 피거나 딱딱하게 굳으면 버리세요',
    tip: '밀봉하여 실온. 오래 보관 시 냉동하고 먹을 때 토스트로',
  },
  '당면': {
    days: 365, storage: '실온', warningDays: 30,
    spoilageSign: '냄새가 나거나 곰팡이가 피면 버리세요',
    tip: '밀폐용기에 넣어 서늘한 곳에 보관',
  },
  '우동면': {
    days: 4, storage: '냉장', warningDays: 1,
    spoilageSign: '신맛이 나거나 끈적이면 버리세요',
    tip: '개봉 후 밀봉하여 냉장. 생우동면은 2~3일 내 사용 권장',
  },
  '쌀국수': {
    days: 365, storage: '실온', warningDays: 30,
    spoilageSign: '냄새가 나거나 습기로 변색되면 버리세요',
    tip: '밀폐용기에 넣어 서늘한 곳에 보관',
  },
  '오트밀': {
    days: 365, storage: '실온', warningDays: 30,
    spoilageSign: '냄새가 나거나 벌레가 생기면 버리세요',
    tip: '밀폐용기에 넣어 서늘하고 건조한 곳에 보관',
  },
  '식빵': {
    days: 5, storage: '실온', warningDays: 2,
    spoilageSign: '곰팡이가 피면 즉시 버리세요 (한 조각에 곰팡이가 피면 전체 버리세요)',
    tip: '밀봉하여 실온. 오래 보관 시 냉동하면 1개월까지 가능',
  },
  '또띠아': {
    days: 7, storage: '실온', warningDays: 2,
    spoilageSign: '곰팡이가 피거나 냄새가 변하면 버리세요',
    tip: '개봉 후 밀봉하여 실온 또는 냉장 보관',
  },

  // ───── 과일 ─────
  '사과': {
    days: 45, storage: '냉장', warningDays: 7,
    spoilageSign: '물러지거나 갈색으로 변하고 곰팡이가 피면 버리세요',
    tip: '에틸렌가스를 배출해 다른 과일을 빨리 숙성시켜요. 따로 보관하세요',
  },
  '바나나': {
    days: 7, storage: '실온', warningDays: 2,
    spoilageSign: '껍질이 완전히 검게 변하거나 안쪽이 물러지면 버리세요',
    tip: '꼭지 부분을 랩으로 감싸면 더 오래 가요. 갈변 방지에는 레몬즙',
  },
  '레몬': {
    days: 14, storage: '냉장', warningDays: 3,
    spoilageSign: '곰팡이가 피거나 껍질이 물러지면 버리세요',
    tip: '밀폐용기에 넣어 냉장. 자른 레몬은 랩으로 밀봉',
  },
  '포도': {
    days: 10, storage: '냉장', warningDays: 3,
    spoilageSign: '물러지거나 하얀 곰팡이가 피면 버리세요',
    tip: '씻지 않고 키친타월에 싸서 냉장. 먹기 전에 씻으세요',
  },
  '딸기': {
    days: 4, storage: '냉장', warningDays: 1,
    spoilageSign: '물러지거나 곰팡이가 피면 버리세요 (한 개에 곰팡이가 피면 인접한 것도 주의)',
    tip: '씻지 않고 키친타월에 싸서 냉장. 습기에 매우 약해요',
  },
  '블루베리': {
    days: 7, storage: '냉장', warningDays: 2,
    spoilageSign: '물러지거나 곰팡이가 피면 버리세요',
    tip: '씻지 않고 통풍되는 용기에 냉장. 먹기 전에 씻으세요',
  },
  '복숭아': {
    days: 7, storage: '냉장', warningDays: 2,
    spoilageSign: '물러지거나 갈색으로 변하면 버리세요',
    tip: '익기 전엔 실온, 익으면 냉장. 금방 상하니 빨리 먹어요',
  },
  '키위': {
    days: 14, storage: '냉장', warningDays: 3,
    spoilageSign: '너무 물러지거나 곰팡이가 피면 버리세요',
    tip: '덜 익은 키위는 실온에서 후숙. 익으면 냉장 보관',
  },
  '수박': {
    days: 5, storage: '냉장', warningDays: 2,
    spoilageSign: '냄새가 이상하거나 살이 물러지고 흰 반점이 생기면 버리세요',
    tip: '자른 수박은 랩으로 밀봉하여 냉장. 씨 부분이 먼저 상하니 빨리 먹어요',
  },
  '배': {
    days: 45, storage: '냉장', warningDays: 7,
    spoilageSign: '지나치게 물러지거나 갈색으로 변하면 버리세요',
    tip: '에틸렌에 민감. 과일향이 강한 것들과 따로 보관',
  },
}

export const DEFAULT_SHELF_LIFE: ShelfLifeInfo = {
  days: 7,
  storage: '냉장',
  warningDays: 2,
  spoilageSign: '색이 변하거나 이상한 냄새가 나면 버리세요',
}

export function getShelfLife(name: string): ShelfLifeInfo {
  return SHELF_LIFE[name] ?? DEFAULT_SHELF_LIFE
}

export function getDaysLeft(addedAt: string, shelfDays: number): number {
  const added = new Date(addedAt)
  const now = new Date()
  const daysElapsed = Math.floor((now.getTime() - added.getTime()) / (1000 * 60 * 60 * 24))
  return shelfDays - daysElapsed
}

export type FreshStatus = 'fresh' | 'warning' | 'expired'

export function getFreshStatus(daysLeft: number, warningDays: number): FreshStatus {
  if (daysLeft <= 0) return 'expired'
  if (daysLeft <= warningDays) return 'warning'
  return 'fresh'
}
