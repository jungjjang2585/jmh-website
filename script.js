const questions = [
    {
        dimension: "EI",
        text: "주말에 에너지를 충전하는 방법은?",
        a: "친구들과 만나서 수다 떨기",
        b: "혼자 집에서 조용히 쉬기"
    },
    {
        dimension: "EI",
        text: "새로운 모임에 갔을 때 나는?",
        a: "먼저 다가가서 말을 건다",
        b: "누군가 말을 걸어주길 기다린다"
    },
    {
        dimension: "SN",
        text: "여행 계획을 세울 때 나는?",
        a: "구체적인 일정과 장소를 미리 정한다",
        b: "대략적인 방향만 정하고 즉흥적으로 움직인다"
    },
    {
        dimension: "SN",
        text: "새로운 것을 배울 때 선호하는 방식은?",
        a: "단계별로 하나씩 실습하며 배운다",
        b: "전체 개념을 먼저 파악한 뒤 세부 사항을 본다"
    },
    {
        dimension: "TF",
        text: "친구가 고민을 이야기할 때 나는?",
        a: "해결 방법을 같이 찾아본다",
        b: "먼저 공감하고 감정을 들어준다"
    },
    {
        dimension: "TF",
        text: "중요한 결정을 내릴 때 나는?",
        a: "장단점을 논리적으로 분석한다",
        b: "내 마음이 끌리는 쪽을 따른다"
    },
    {
        dimension: "JP",
        text: "과제나 업무를 처리할 때 나는?",
        a: "미리미리 계획대로 끝낸다",
        b: "마감 직전에 집중해서 해낸다"
    },
    {
        dimension: "JP",
        text: "일상생활에서 나는?",
        a: "정해진 루틴이 있으면 편하다",
        b: "상황에 따라 유연하게 움직인다"
    }
];

const mbtiDescriptions = {
    ISTJ: "청렴결백한 논리주의자",
    ISFJ: "용감한 수호자",
    INFJ: "선의의 옹호자",
    INTJ: "용의주도한 전략가",
    ISTP: "만능 재주꾼",
    ISFP: "호기심 많은 예술가",
    INFP: "열정적인 중재자",
    INTP: "논리적인 사색가",
    ESTP: "모험을 즐기는 사업가",
    ESFP: "자유로운 영혼의 연예인",
    ENFP: "재기발랄한 활동가",
    ENTP: "뜨거운 논쟁을 즐기는 변론가",
    ESTJ: "엄격한 관리자",
    ESFJ: "사교적인 외교관",
    ENFJ: "정의로운 사회운동가",
    ENTJ: "대담한 통솔자"
};

const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
let current = 0;

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const startBtn = document.getElementById("start-btn");
const retryBtn = document.getElementById("retry-btn");
const optionA = document.getElementById("option-a");
const optionB = document.getElementById("option-b");
const progressFill = document.getElementById("progress-fill");
const questionNumber = document.getElementById("question-number");
const questionText = document.getElementById("question-text");

function showScreen(screen) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    screen.classList.add("active");
}

function loadQuestion() {
    const q = questions[current];
    progressFill.style.width = ((current) / questions.length * 100) + "%";
    questionNumber.textContent = `질문 ${current + 1} / ${questions.length}`;
    questionText.textContent = q.text;
    optionA.textContent = `A. ${q.a}`;
    optionB.textContent = `B. ${q.b}`;
}

function handleAnswer(choice) {
    const q = questions[current];
    const dim = q.dimension;
    if (choice === "A") {
        scores[dim[0]]++;
    } else {
        scores[dim[1]]++;
    }
    current++;
    if (current < questions.length) {
        loadQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    const type = [
        scores.E >= scores.I ? "E" : "I",
        scores.S >= scores.N ? "S" : "N",
        scores.T >= scores.F ? "T" : "F",
        scores.J >= scores.P ? "J" : "P"
    ].join("");

    document.getElementById("result-type").textContent = type;
    document.getElementById("result-desc").textContent = mbtiDescriptions[type];

    const dims = [
        { left: "E", right: "I" },
        { left: "S", right: "N" },
        { left: "T", right: "F" },
        { left: "J", right: "P" }
    ];

    const detailEl = document.getElementById("result-detail");
    detailEl.innerHTML = dims.map(d => {
        const total = scores[d.left] + scores[d.right];
        const pct = total === 0 ? 50 : Math.round((scores[d.left] / total) * 100);
        const winner = pct >= 50 ? d.left : d.right;
        const winPct = pct >= 50 ? pct : 100 - pct;
        return `
            <div class="dimension">
                <span class="label">${d.left}</span>
                <div class="bar-wrap">
                    <div class="bar-inner" style="width: ${pct}%"></div>
                </div>
                <span class="label">${d.right}</span>
                <span class="percent">${winner} ${winPct}%</span>
            </div>
        `;
    }).join("");

    progressFill.style.width = "100%";
    showScreen(resultScreen);
}

function reset() {
    current = 0;
    Object.keys(scores).forEach(k => scores[k] = 0);
    showScreen(startScreen);
}

startBtn.addEventListener("click", () => {
    showScreen(quizScreen);
    loadQuestion();
});

optionA.addEventListener("click", () => handleAnswer("A"));
optionB.addEventListener("click", () => handleAnswer("B"));
retryBtn.addEventListener("click", reset);
