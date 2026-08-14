document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const documentList = document.getElementById('documentList');
    const deployBtn = document.getElementById('deployBtn');
    
    const contentPlaceholder = document.getElementById('contentPlaceholder');
    const markdownViewer = document.getElementById('markdownViewer');
    const docTitle = document.getElementById('docTitle');
    const docCategory = document.getElementById('docCategory');
    const markdownContent = document.getElementById('markdownContent');
    const searchNavigator = document.getElementById('searchNavigator');
    const matchCount = document.getElementById('matchCount');
    const prevMatchBtn = document.getElementById('prevMatchBtn');
    const nextMatchBtn = document.getElementById('nextMatchBtn');
    const appContainer = document.getElementById('appContainer');
    const backBtn = document.getElementById('backBtn');
    const learningHome = document.getElementById('learningHome');
    const learningTabBtns = document.querySelectorAll('.learning-tab');
    const flashcard = document.getElementById('flashcard');
    const flashcardQuestion = document.getElementById('flashcardQuestion');
    const flashcardAnswer = document.getElementById('flashcardAnswer');
    const learningCount = document.getElementById('learningCount');
    const nextQuestionBtn = document.getElementById('nextQuestionBtn');
    const searchModal = document.getElementById('searchModal');
    const searchModalResults = document.getElementById('searchModalResults');
    const searchModalTitle = document.getElementById('searchModalTitle');
    const closeSearchModalBtn = document.getElementById('closeSearchModalBtn');

    // State
    let currentFilter = '전체'; // 전체, 규정, 지침
    let searchQuery = '';
    let activeDocId = null;
    let highlightElements = [];
    let currentHighlightIndex = -1;
    let editor = null;
    let currentLearningTab = 'common';
    let currentQuestionIndex = 0;
    const urlParams = new URLSearchParams(window.location.search);
    const hostName = window.location.hostname || '';
    const isLocalEditorHost = ['localhost', '127.0.0.1', '::1', ''].includes(hostName);
    const isEditorMode = isLocalEditorHost && urlParams.get('preview') !== 'learning';
    const isLearningPreview = !isEditorMode;
    
    // Editor Elements
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const editorContainer = document.getElementById('editorContainer');
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    const applyFontSizeBtn = document.getElementById('applyFontSizeBtn');
    const FONT_SIZE_VALUES = '12|14|16|18|20|24|28|32';
    const learningQuestionBank = {
        common: [
            { question: '병원 복도에서 환자가 갑자기 쓰러진 것을 발견했다면 어떻게 대처합니까?', answer: '반응을 확인하고 주변에 도움을 요청한 뒤 “8282”로 CPR 방송(Code Blue와 위치)을 합니다. CPR팀 도착 전까지 가슴압박과 인공호흡을 지속합니다.' },
            { question: 'AED(자동제세동기)는 어디에 있습니까?', answer: '상황 발생 시 3분 이내 가져올 수 있는 위치에 비치되어 있으며, 지하 1층 재활의학과와 핵의학과에 있습니다.' },
            { question: '병원 내 주요 응급 코드의 의미는 무엇입니까?', answer: 'Code Blue는 심정지·CPR(8282), Code Red는 화재(8119→8282), Code Pink는 영유아 유괴(8282), Code White는 전산장애(7051), Code Yellow는 내부 재난, Code Black은 외부 재난 상황입니다.' },
            { question: '약제팀 근처에서 화재를 최초로 발견했을 때 초기 행동요령은 무엇입니까?', answer: '“불이야”라고 외쳐 주위에 알리고, “8119” 방재센터에 즉시 신고합니다. 소화기로 초기 진압한 뒤 부서 관리자에게 보고합니다.' },
            { question: '초기 진압에 실패하여 화재가 확대되면 어떻게 대응합니까?', answer: '소화전 발신기(비상경보) 버튼을 누르고 “8282”로 화재 신고(Code Red와 위치)를 합니다. 119에 신고하고 환자를 대피시키며 화재 진압에 협조합니다.' },
            { question: 'Code Red 발령 시 약제팀의 역할은 무엇입니까?', answer: '약제팀은 병원 전체 자위소방대 편성상 응급구조팀에 소속되어 의료 지원 업무를 수행합니다. 부서 내에서는 초기 소화팀과 피난유도팀 역할을 수행합니다.' },
            { question: '소화기 위치와 사용법을 설명해 보세요.', answer: '소화기는 산제조제실 앞, 원내제제실 앞, 소화전 안에 있습니다. 안전핀을 뽑고 호스를 분리한 뒤 손잡이를 움켜쥐고, 바람을 등지고 빗자루로 쓸듯이 분사합니다.' },
            { question: '유해화학물질이 바닥에 누출되었을 때 어떻게 처리합니까?', answer: '경고표지로 접근을 제한하고 Spill Kit의 마스크·보호장갑·GOWN을 착용합니다. 흡착포로 제거하여 물질명·부서명·폐기일자를 적은 지퍼락에 밀봉하고 의료폐기물로 처리합니다.' },
            { question: '유해화학물질이 눈에 들어갔을 때는 어떻게 합니까?', answer: '콘택트렌즈를 제거한 뒤 흐르는 물 또는 생리식염수 1L 이상으로 15분 이상 세척합니다.' },
            { question: '유해화학물질이 피부·호흡기·소화기로 노출되었을 때는 어떻게 합니까?', answer: '피부는 15분 이상 다량의 물로 세척하고, 흡입 시 신선한 공기가 있는 곳으로 이동합니다. 섭취 시 구토를 유도하지 말고 즉시 전문가 응급진료를 받습니다.' },
            { question: '개인정보 보호를 위해 어떤 조치를 하고 있습니까?', answer: '업무 종료 시 화면보호기를 설정하거나 HIS에서 로그아웃합니다. 환자정보가 표시된 종이는 이면지로 사용하지 않고 파쇄·소각 처리합니다.' },
            { question: '환자 정보 조회·열람 시 지켜야 할 원칙은 무엇입니까?', answer: '본인이 담당하는 환자에 한해 업무에 필요한 범위에서만 조회합니다. 개인 ID와 비밀번호는 타인과 공유하지 않으며 조회 이력은 시스템 로그에 남습니다.' },
            { question: '환자가 본인 진료기록 사본을 요청하면 어떻게 합니까?', answer: '신분증으로 본인 확인 후 원무팀 의무기록 발급 창구로 안내합니다. 대리인에게는 위임장, 가족관계증명서, 환자와 대리인의 신분증 관련 서류가 필요합니다.' },
            { question: '주사침에 찔리는 사고가 발생하면 어떻게 합니까?', answer: '즉시 피를 짜내고 물과 손소독제로 세척·소독합니다. 정규시간에 HIS 감염노출보고서를 작성하고 감염관리실에 통보하여 감염내과에서 필요 검사와 투약을 받습니다.' },
            { question: '혈액·체액이 눈이나 점막에 튀었을 때는 어떻게 합니까?', answer: '흐르는 물 또는 생리식염수로 15분 이상 세척한 뒤 HIS 감염노출보고서를 작성하고 감염관리실에 통보합니다.' },
            { question: '환자나 보호자가 폭언·폭행을 할 경우 어떻게 합니까?', answer: '즉시 안전한 장소로 이동하고 9119로 보안을 호출합니다. 부서장과 총무팀에 보고한 뒤 HIS 직원안전보고서를 작성합니다.' },
            { question: '손위생을 수행해야 하는 WHO 5 Moments는 무엇입니까?', answer: '환자 접촉 전, 청결·무균 처치 전, 체액 노출 위험 후, 환자 접촉 후, 환자 주변 환경 접촉 후입니다.' },
            { question: '아동·노인·장애인 학대가 의심되는 환자를 발견했을 때는 어떻게 합니까?', answer: '담당 의사와 간호사에게 즉시 보고하고 사회사업실 협진을 의뢰합니다. HIS에 학대 의심을 기록하며 사진과 상흔은 의무기록에 상세히 기재합니다.' },
            { question: '병원 내 장애인 편의시설에는 무엇이 있습니까?', answer: '주출입구 접근로와 높이차이 제거, 장애인전용 주차구역, 출입구, 복도, 계산대 또는 승강기, 화장실의 대변기·소변기·세면대 등이 있습니다.' },
            { question: '환자안전 사건은 어떻게 보고합니까?', answer: '발생 즉시 문제를 해결하고 HIS 환자안전사고보고서를 작성하여 24시간 내 PI실에 보고합니다. 보고서 작성이 어려우면 부서장이 PI실에 먼저 유선 보고합니다.' },
            { question: '의사소통이 어려운 환자는 어떻게 지원합니까?', answer: '환자의 요구를 파악하고 통역사, 수어, 구화, 필담, 문자통역 또는 통역센터 등 외부지원을 활용합니다.' },
            { question: '2026년 약제팀 의약품관리 사업계획의 추가 사업은 무엇입니까?', answer: '안전한 의약품 처방·조제 항목에 신기능 기반 항생제 용량 CDSS(임상의사결정지원시스템) 구축 사업을 추가합니다.' },
            { question: '2026년 약제팀 QI 주제는 무엇입니까?', answer: '항생제 적정사용 관리(ASP, Antimicrobial Stewardship Program) 활동의 시스템 고도화입니다.' }
        ],
        pharmacy: [
            { question: '구두처방 또는 전화처방은 어떤 상황에서만 허용됩니까?', answer: '수술·시술·응급상황 등 처방 입력이 불가능한 제한된 상황에서만 허용됩니다. 마약류·항암제·혈액제제는 원칙적으로 구두처방할 수 없습니다.' },
            { question: '구두처방 수신 시 Read-back 절차는 어떻게 됩니까?', answer: 'Write down(받아 적기), Read-back(다시 읽어주기), Confirm(처방자 확인) 순서입니다. 숫자와 낯선 약품명, 용량·단위를 정확히 확인하며 마약은 Read-back을 2회 시행합니다.' },
            { question: 'PRN 처방의 필수 기재사항은 무엇입니까?', answer: '투여 조건, 1회 용량, 투여 경로, 최소 투여 간격, 1일 최대 투여 횟수를 기재해야 합니다.' },
            { question: 'PRN 처방이 불가능한 의약품은 무엇입니까?', answer: '전해질제제, 헤파린 주사제, 항암제류, 백신, 경구용 항응고제, 항생제 주사제, 면역억제제, 혈액제제입니다.' },
            { question: '항암제를 취급할 수 있는 자격은 무엇입니까?', answer: '취급 책임자로부터 취급 전 및 업무 수행 중 적절한 교육과 평가를 받은 의사, 약사, 간호사입니다.' },
            { question: '항암제 처방 감사는 어떻게 이루어집니까?', answer: '의사는 체중·키·BSA·AUC 기반 용량과 투여경로·시간을 확인합니다. 약사는 조제 전 환자정보, Regimen 적절성, 용량, 희석수액, 상호작용을 검토하고 조제 후 감사를 시행합니다.' },
            { question: '항암제는 어디서 어떻게 조제합니까?', answer: '외부인 출입이 통제되고 온·습도가 조절되는 주사조제실의 Class II biological cabinet에서 조제합니다. 이중 장갑, 마스크, 모자, 보호복을 착용합니다.' },
            { question: '항암제 투여 중 일혈이 발생하면 어떻게 합니까?', answer: '즉시 주입을 중단하되 카뉴라는 제거하지 않고 약물을 흡인합니다. 이후 혈관외 약물 유출 시 치료 지침에 따라 해독제 적용 여부를 결정합니다.' },
            { question: '약사위원회는 언제 개최되며 어떤 역할을 합니까?', answer: '매년 3월과 9월, 연 2회 정기 개최합니다. 사업계획 승인·평가, 신약 선정, 신규의약품 효과 모니터링, 소모부진 의약품 관리, 사용 지침 제정, 의약품 사용 평가와 목록 관리를 수행합니다.' },
            { question: '제한항생제는 어떻게 관리합니까?', answer: '처방 시 감염내과 또는 소아청소년과 교수에게 협진 의뢰와 사전 승인이 필요합니다. 7일을 초과하면 재자문하고, 4일 이내 승인되지 않으면 처방 입력이 차단됩니다.' },
            { question: '마약류는 어떻게 보관합니까?', answer: '마약은 다른 약품과 구분하여 이중 잠금장치가 된 이동 불가능한 철제금고에 보관합니다. 향정신성 의약품도 잠금장치가 있는 이동 불가능한 장소에 구분 보관하며 매일 사용량과 실재고를 확인합니다.' },
            { question: '고위험의약품은 어떻게 보관합니까?', answer: '고농도 전해질, 헤파린, 인슐린, 항암제, 중등도 진정 의약품, 신경근 차단제는 “고위험의약품” 라벨 부착 장소에 다른 약품과 분리 보관합니다.' },
            { question: '응급카트(E-cart)는 어떻게 관리합니까?', answer: '외부인 출입이 통제되는 장소에 보관하고 시리얼 번호가 포함된 봉인 스티커를 부착하여 관리대장에 기록합니다. 부서는 월 1회 수량·유효기간을 점검하고 매일 봉인 상태를 확인합니다.' },
            { question: '백신은 어떻게 보관합니까?', answer: '2~8℃가 유지되는 냉장고에 보관하고 디지털 온도계 온도를 매일 1회 이상 기록·점검합니다. 장비 업체 연락처와 백신 담당자를 냉장고에 부착하고 온도 기록지를 비치합니다.' },
            { question: '회수 대상 의약품이 발생하면 어떻게 처리합니까?', answer: '회수 공문을 접수하고 관리대장에 기록한 뒤 원내 게시판과 약제팀에 공지합니다. HIS 코드를 종료하고 보유량을 확인하여 도매상에 반품한 뒤 완료일을 관리대장에 기록합니다.' },
            { question: '처방의 필수 구성요소는 무엇입니까?', answer: '처방일자·시간, 약품명, 투여량·단위, 투여경로, 희석액·희석농도·투여속도·재구성 용해액, 투여 간격(PRN은 투여 기준 포함), 의사의 전자서명입니다.' },
            { question: '의약품 투여 시 확인해야 할 6 Rights는 무엇입니까?', answer: 'Right Drug, Right Dose, Right Patient(2가지 이상 정보), Right Route, Right Time, Right Documentation입니다.' },
            { question: '고농도 전해질(KCl) 투여 시 주의사항은 무엇입니까?', answer: '반드시 희석하여 투여합니다. KCl 농도 40 mEq/L 초과 시 infusion pump를 사용하고 100 mEq/L 초과 시 중심정맥관을 사용합니다.' },
            { question: '헤파린과 인슐린의 보관 원칙은 무엇입니까?', answer: 'IU 단위로 처방되는 모든 약물 및 외관이 비슷한 약물과 분리 보관합니다. 헤파린 과량 투여 시 해독제는 황산프로타민이며 인슐린 저혈당 기준은 70 mg/dL 이하입니다.' },
            { question: '신경근 차단제 투여 시 원칙은 무엇입니까?', answer: '회복실·중환자실·응급실에서만 처방할 수 있으며 반드시 마취 또는 진정 상태에서 의사의 감독 하에 투여합니다.' },
            { question: '사용 후 남은 의약품은 어떻게 폐기합니까?', answer: '모든 의약품은 위해 의료폐기물로 생물·화학폐기물 처리 절차에 따라 폐기합니다. 마약류 잔량은 약제팀에 반납 후 입회하에 폐기하며 고위험의약품 잔량은 즉시 폐기합니다.' },
            { question: '지참약은 어떻게 관리합니까?', answer: '입원 시 복용 여부를 확인하고 필요하면 약제팀에 식별을 의뢰합니다. 원내 코드가 있으면 전산 입력 후 지참약을 체크하며 임의 복용은 금지하고 간호사가 수거·관리 후 퇴원 시 반환합니다.' },
            { question: '약물이상반응(ADR) 발생 시 보고 절차는 어떻게 됩니까?', answer: '의사·약사·간호사·관련 직원이 HIS 약물이상반응 보고 화면에서 보고합니다. 약사는 환자정보·투약내역·의무기록·경과를 모니터링하고 원외 보고는 의약품안전나라에 온라인으로 합니다.' },
            { question: '중대한 이상반응이 확인된 환자에게 어떻게 안내합니까?', answer: '환자에게 해당 내용을 교육하고 숙지시킵니다. 필요하면 약물부작용 예방 카드를 교부하여 타 의료기관 진료 시 제시하도록 안내합니다.' },
            { question: '냉장보관약품이 온도범위를 벗어난 경우 어떻게 합니까?', answer: '온도 범위를 벗어난 시간을 확인하여 약제팀 약품관리 담당자에게 보고합니다. 정상화에 1시간 이상 걸리면 의약품을 다른 냉장고로 옮기고 파트장 또는 팀장에게 보고합니다.' },
            { question: '의약품 운반 중 파손을 방지하려면 어떻게 합니까?', answer: '마약은 마약이송함을 이용하고, 항암제는 Spill Kit가 들어 있는 항암제 이송함을 이용합니다.' },
            { question: 'PRN 처방인지 어떻게 확인할 수 있습니까?', answer: '오더·감사 화면에서 PRN “Y”로 확인하며, 처방전에는 약품코드와 약품명 사이에 “PRN” 및 적응증이 표시됩니다.' },
            { question: '외국인 환자와 의사소통이 원활하지 않을 때 복약지도는 어떻게 합니까?', answer: 'BBB Korea(1588-5644)를 이용하거나 사회사업실에 통역서비스 제공 가능자의 지원을 요청합니다.' },
            { question: '약제팀 QI 관련 핵심지표는 무엇입니까?', answer: '조제오류율입니다.' }
        ]
    };

    // Initialize App
    function init() {
        if (isLearningPreview && deployBtn) {
            deployBtn.style.display = 'none';
        }

        // Sort documentsData: 1-x documents numerically first, then alphabetically
        documentsData.sort((a, b) => {
            const matchA = a.title.match(/(?:^|\[)1-(\d+)/);
            const matchB = b.title.match(/(?:^|\[)1-(\d+)/);

            if (matchA && matchB) {
                return parseInt(matchA[1]) - parseInt(matchB[1]);
            } else if (matchA) {
                return -1;
            } else if (matchB) {
                return 1;
            } else {
                return a.title.localeCompare(b.title, 'ko-KR');
            }
        });

        renderDocumentList();
        renderLearningCard(true);
        setupEventListeners();
    }

    // Event Listeners
    function setupEventListeners() {
        // Tab clicks
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                tabBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentFilter = e.target.dataset.tab;
                renderDocumentList();
            });
        });

        // Search input
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            renderDocumentList();
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            openSearchModal();
        });

        learningTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                currentLearningTab = btn.dataset.learningTab;
                currentQuestionIndex = 0;
                learningTabBtns.forEach(tab => {
                    const isActive = tab === btn;
                    tab.classList.toggle('active', isActive);
                    tab.setAttribute('aria-selected', String(isActive));
                });
                renderLearningCard(true);
            });
        });

        if (flashcard) {
            flashcard.addEventListener('click', () => {
                flashcard.classList.toggle('is-flipped');
            });
        }

        if (nextQuestionBtn) {
            nextQuestionBtn.addEventListener('click', () => renderLearningCard(true));
        }

        if (closeSearchModalBtn) {
            closeSearchModalBtn.addEventListener('click', closeSearchModal);
        }

        if (searchModal) {
            searchModal.addEventListener('click', (e) => {
                if (e.target === searchModal) closeSearchModal();
            });
        }

        // Trace navigation
        prevMatchBtn.addEventListener('click', () => {
            if (highlightElements.length > 0) {
                currentHighlightIndex = (currentHighlightIndex - 1 + highlightElements.length) % highlightElements.length;
                updateHighlightSelection();
            }
        });

        nextMatchBtn.addEventListener('click', () => {
            if (highlightElements.length > 0) {
                currentHighlightIndex = (currentHighlightIndex + 1) % highlightElements.length;
                updateHighlightSelection();
            }
        });

        // Mobile back button
        backBtn.addEventListener('click', () => {
            showLearningHome();
        });

        // Deploy button
        if (deployBtn) {
            deployBtn.addEventListener('click', async () => {
                if (!confirm('현재까지의 수정 내용을 링크(웹)에 반영하시겠습니까?\n(약 10초 정도 소요됩니다.)')) {
                    return;
                }

                try {
                    const data = await deployChanges();
                    alert(data.message);
                } catch (e) {
                    alert(e.message);
                    console.error(e);
                }
            });
        }
    }

    function getLearningQuestions() {
        return learningQuestionBank[currentLearningTab] || [];
    }

    function renderLearningCard(chooseRandom) {
        const questions = getLearningQuestions();
        if (!flashcard || !flashcardQuestion || !flashcardAnswer || questions.length === 0) return;

        if (chooseRandom) {
            let nextIndex = Math.floor(Math.random() * questions.length);
            if (questions.length > 1 && nextIndex === currentQuestionIndex) {
                nextIndex = (nextIndex + 1) % questions.length;
            }
            currentQuestionIndex = nextIndex;
        }

        const card = questions[currentQuestionIndex];
        flashcardQuestion.textContent = card.question;
        flashcardAnswer.textContent = card.answer;
        flashcard.classList.remove('is-flipped');
        if (learningCount) {
            learningCount.textContent = `${currentLearningTab === 'common' ? '공통 사항' : '약제 사항'} · ${questions.length}문항`;
        }
    }

    function showLearningHome() {
        if (learningHome) learningHome.classList.remove('hidden');
        if (contentPlaceholder) contentPlaceholder.classList.add('hidden');
        if (markdownViewer) markdownViewer.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('mobile-view-doc');
        activeDocId = null;
        renderDocumentList();
    }

    function getSearchResults(query) {
        const normalizedQuery = String(query || '').trim().toLowerCase();
        if (!normalizedQuery) return [];

        return documentsData.filter(doc => {
            const title = String(doc.title || '').toLowerCase();
            const content = normalizeEditorMarkup(doc.content).toLowerCase();
            return title.includes(normalizedQuery) || content.includes(normalizedQuery);
        });
    }

    function openSearchModal() {
        if (!searchModal || !searchModalResults || !searchModalTitle) return;
        const query = searchInput ? searchInput.value.trim() : '';
        const results = getSearchResults(query);
        searchModalTitle.textContent = query ? `“${query}” 검색 결과` : '검색어를 입력해 주세요';
        searchModalResults.innerHTML = '';

        if (!query) {
            const message = document.createElement('p');
            message.className = 'search-modal-empty';
            message.textContent = '좌측 검색창에 키워드를 입력한 뒤 Enter를 눌러 주세요.';
            searchModalResults.appendChild(message);
        } else if (results.length === 0) {
            const message = document.createElement('p');
            message.className = 'search-modal-empty';
            message.textContent = '관련 문서를 찾지 못했습니다.';
            searchModalResults.appendChild(message);
        } else {
            results.forEach(doc => {
                const result = document.createElement('button');
                result.type = 'button';
                result.className = 'search-result-card';
                const content = normalizeEditorMarkup(doc.content).replace(/\s+/g, ' ');
                const matchIndex = content.toLowerCase().indexOf(query.toLowerCase());
                const snippetStart = Math.max(0, matchIndex - 45);
                const snippet = matchIndex >= 0 ? content.slice(snippetStart, matchIndex + query.length + 95) : content.slice(0, 130);
                result.innerHTML = `<span class="search-result-category">${getDocCategory(doc)}</span><strong></strong><span></span>`;
                result.querySelector('strong').textContent = doc.title;
                result.querySelector('span:last-child').textContent = snippet;
                result.addEventListener('click', () => {
                    searchModal.classList.add('hidden');
                    viewDocument(doc);
                });
                searchModalResults.appendChild(result);
            });
        }

        searchModal.classList.remove('hidden');
        closeSearchModalBtn?.focus();
    }

    function closeSearchModal() {
        if (searchModal) searchModal.classList.add('hidden');
        if (searchInput) searchInput.value = '';
        searchQuery = '';
        showLearningHome();
    }

    async function deployChanges() {
        const originalText = deployBtn ? deployBtn.innerHTML : '';
        if (deployBtn) {
            deployBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 반영 중...';
            deployBtn.disabled = true;
        }

        try {
            const response = await fetch('/api/deploy', { method: 'POST' });
            let data = {};
            try {
                data = await response.json();
            } catch (e) {
                data = {};
            }

            if (!response.ok) {
                throw new Error(data.message ? `웹 반영 오류: ${data.message}` : '웹 반영에 실패했습니다.');
            }

            return data;
        } catch (e) {
            if (e.message && e.message.startsWith('웹 반영')) {
                throw e;
            }
            throw new Error('서버 연결 오류. 로컬 서버(앱_실행하기.bat)로 열었는지 확인하세요.');
        } finally {
            if (deployBtn) {
                deployBtn.innerHTML = originalText;
                deployBtn.disabled = false;
            }
        }
    }

    // Render Document List
    function renderDocumentList() {
        documentList.innerHTML = '';

        // Filter original list based on tab only
        const originalDocs = documentsData.filter(doc => currentFilter === '전체' || getDocCategory(doc) === normalizeCategory(currentFilter));

        // If there's a search query, filter search results
        let searchResults = [];
        if (searchQuery) {
            documentsData.forEach(doc => {
                const matchesFilter = currentFilter === '전체' || getDocCategory(doc) === normalizeCategory(currentFilter);
                if (!matchesFilter) return;

                const cleanContent = normalizeEditorMarkup(doc.content);
                const titleMatch = doc.title.toLowerCase().includes(searchQuery);
                const contentIndex = cleanContent.toLowerCase().indexOf(searchQuery);
                
                if (titleMatch || contentIndex !== -1) {
                    let snippet = null;
                    if (contentIndex !== -1) {
                        const start = Math.max(0, contentIndex - 40);
                        const end = Math.min(cleanContent.length, contentIndex + 80);
                        snippet = cleanContent.substring(start, end).replace(/\n/g, ' ');
                        
                        if (start > 0) snippet = '...' + snippet;
                        if (end < cleanContent.length) snippet = snippet + '...';
                        
                        const regex = new RegExp(`(${escapeRegExp(searchQuery)})`, 'gi');
                        snippet = snippet.replace(regex, '<mark>$1</mark>');
                    }
                    searchResults.push({ ...doc, snippet });
                }
            });

            // Render Search Results Header
            const searchHeader = document.createElement('div');
            searchHeader.style.padding = '10px 5px';
            searchHeader.style.fontWeight = 'bold';
            searchHeader.style.color = 'var(--primary-color)';
            searchHeader.style.borderBottom = '1px solid var(--border-color)';
            searchHeader.style.marginBottom = '10px';
            searchHeader.textContent = `검색 결과 (${searchResults.length}건)`;
            documentList.appendChild(searchHeader);

            if (searchResults.length === 0) {
                const noResult = document.createElement('div');
                noResult.style.padding = '10px';
                noResult.style.color = 'var(--text-secondary)';
                noResult.style.fontSize = '0.9rem';
                noResult.textContent = '검색 결과가 없습니다.';
                documentList.appendChild(noResult);
            } else {
                renderItems(searchResults, true);
            }

            // Render Original List Header
            const origHeader = document.createElement('div');
            origHeader.style.padding = '10px 5px';
            origHeader.style.fontWeight = 'bold';
            origHeader.style.color = 'var(--text-secondary)';
            origHeader.style.borderBottom = '1px solid var(--border-color)';
            origHeader.style.marginBottom = '10px';
            origHeader.style.marginTop = '20px';
            origHeader.textContent = `${currentFilter === '업무정리' ? '조제실 업무 정리' : currentFilter} 목록`;
            documentList.appendChild(origHeader);
            
            renderItems(originalDocs, false);
        } else {
            // Just render original list
            if (originalDocs.length === 0) {
                documentList.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">문서가 없습니다.</div>';
            } else {
                renderItems(originalDocs, false);
            }
        }
    }

    function renderItems(docs, isSearchResult) {
        docs.forEach(doc => {
            const item = document.createElement('div');
            item.className = `doc-item ${doc.id === activeDocId ? 'active' : ''}`;
            
            const title = document.createElement('div');
            title.className = 'doc-item-title';
            // Highlight query in title if present
            if (searchQuery) {
                const regex = new RegExp(`(${escapeRegExp(searchQuery)})`, 'gi');
                title.innerHTML = doc.title.replace(regex, '<mark>$1</mark>');
            } else {
                title.textContent = doc.title;
            }
            
            const meta = document.createElement('div');
            meta.className = 'doc-item-meta';
            const badge = document.createElement('span');
            const category = getDocCategory(doc);
            badge.className = `badge badge-${category}`;
            badge.textContent = category;
            meta.appendChild(badge);
            
            item.appendChild(title);
            item.appendChild(meta);

            if (doc.snippet) {
                const snippetEl = document.createElement('div');
                snippetEl.className = 'doc-item-snippet';
                snippetEl.innerHTML = doc.snippet;
                item.appendChild(snippetEl);
            }

            // Click event to view document
            item.addEventListener('click', () => {
                // Update active state in list
                document.querySelectorAll('.doc-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                
                // View document
                viewDocument(doc);
            });

            documentList.appendChild(item);
        });
    }

    // View Document Content
    function viewDocument(doc) {
        activeDocId = doc.id;
        
        // Hide placeholder, show viewer
        contentPlaceholder.classList.add('hidden');
        if (learningHome) learningHome.classList.add('hidden');
        markdownViewer.classList.remove('hidden');

        // Toggle mobile view
        appContainer.classList.add('mobile-view-doc');
        
        // Set metadata
        docTitle.textContent = doc.title;
        const category = getDocCategory(doc);
        docCategory.textContent = category;
        docCategory.className = `badge badge-${category}`;

        // Render Markdown
        // marked.parse() is provided by the CDN script
        try {
            let htmlContent = marked.parse(renderFontSizeMarkup(doc.content), { breaks: true });
            
            // Highlight the search query in the main content if it exists
            if (searchQuery) {
                const regex = new RegExp(`(?![^<]*>)(${escapeRegExp(searchQuery)})`, 'gi');
                htmlContent = htmlContent.replace(regex, '<mark class="search-highlight">$1</mark>');
            }
            
            markdownContent.innerHTML = htmlContent;
        } catch (e) {
            markdownContent.innerHTML = `<div style="color: red;">마크다운 변환 중 오류가 발생했습니다.</div><pre>${doc.content}</pre>`;
        }
        
        // Setup tracing
        if (searchQuery) {
            highlightElements = Array.from(markdownContent.querySelectorAll('mark.search-highlight'));
            if (highlightElements.length > 0) {
                searchNavigator.classList.remove('hidden');
                currentHighlightIndex = 0;
                updateHighlightSelection();
            } else {
                searchNavigator.classList.add('hidden');
                document.querySelector('.main-content').scrollTop = 0;
            }
        } else {
            searchNavigator.classList.add('hidden');
            highlightElements = [];
            document.querySelector('.main-content').scrollTop = 0;
        }
        
        // Reset edit button state when switching documents
        if (editorContainer && markdownContent && editBtn) {
            editorContainer.classList.add('hidden');
            markdownContent.classList.remove('hidden');
            editBtn.style.display = isLearningPreview ? 'none' : 'flex';
        }
    }
    
    // Editor Logic
    // Editor Logic
    if (!isLearningPreview) {
        editBtn.addEventListener('click', () => {
            markdownContent.classList.add('hidden');
            editorContainer.classList.remove('hidden');
            editBtn.style.display = 'none';
            
            const doc = documentsData.find(d => d.id === activeDocId);
            
            if (!editor) {
                editor = new toastui.Editor({
                    el: document.getElementById('toastEditor'),
                    height: '600px',
                    initialEditType: 'wysiwyg',
                    previewStyle: 'vertical',
                    initialValue: normalizeEditorMarkup(doc.content),
                    plugins: [toastui.Editor.plugin.colorSyntax],
                    widgetRules: [
                        {
                            rule: /\[font size="(12|14|16|18|20|24|28|32)"\]([\s\S]*?)\[\/font\]/g,
                            toDOM(text) {
                                const normalizedText = normalizeFontMarkup(text);
                                const match = normalizedText.match(/^\[font size="(12|14|16|18|20|24|28|32)"\]([\s\S]*?)\[\/font\]$/);
                                const span = document.createElement('span');
                                span.style.fontSize = `${match ? match[1] : 16}px`;
                                span.textContent = match ? match[2] : normalizedText;
                                return span;
                            }
                        }
                    ],
                    hooks: {
                        addImageBlobHook: async (blob, callback) => {
                            const formData = new FormData();
                            formData.append('image', blob);
                            try {
                                const response = await fetch('/api/upload', {
                                    method: 'POST',
                                    body: formData
                                });
                                const data = await response.json();
                                callback(data.url, 'image');
                            } catch (err) {
                                console.error('Image upload failed', err);
                                alert('이미지 업로드에 실패했습니다. (앱_실행하기.bat 로 실행 중인지 확인)');
                            }
                        }
                    }
                });
            } else {
                editor.setMarkdown(normalizeEditorMarkup(doc.content));
            }
        });

        if (applyFontSizeBtn && fontSizeSelect) {
            applyFontSizeBtn.addEventListener('mousedown', (event) => {
                event.preventDefault();
            });
            applyFontSizeBtn.addEventListener('click', applySelectedFontSize);
        }
    }

    function applySelectedFontSize() {
        if (!editor || typeof editor.replaceSelection !== 'function') {
            alert('편집기를 먼저 열어주세요.');
            return;
        }

        const size = fontSizeSelect.value;
        const selectedText = typeof editor.getSelectedText === 'function' ? editor.getSelectedText() : '';
        const text = selectedText || '글자';
        editor.replaceSelection(`[font size="${size}"]${text.replace(/\[\/font\]/g, '')}[/font]`);

        if (typeof editor.focus === 'function') {
            editor.focus();
        }
    }

    function normalizeFontMarkup(markdown) {
        return String(markdown || '')
            .replace(/\$\$widget\d+\s+([\s\S]*?)\$\$/g, '$1')
            .replace(new RegExp(`\\\\\\[font size=\\\\?"(${FONT_SIZE_VALUES})\\\\?"\\\\\\]`, 'g'), '[font size="$1"]')
            .replace(/\\\[\/font\\\]/g, '[/font]');
    }

    function normalizeImageMarkup(markdown) {
        return String(markdown || '')
            .replace(/\\!\\\[([^\]]*)\\\]\\\((images\/[^)\s]+)\\\)/g, '![$1]($2)')
            .replace(/!\[([^\]]*)\](images\/[^\s)]+)/g, '![$1]($2)');
    }

    function renderImageMarkup(markdown) {
        return normalizeImageMarkup(markdown).replace(
            /!\[([^\]]*)\]\((images\/[^)\s]+)\)/g,
            (_, alt, src) => `<img src="${src}" alt="${alt || 'image'}">`
        );
    }

    function normalizeImportedDocumentMarkup(markdown) {
        let normalized = String(markdown || '')
            .replace(/^\s*동국대학교\s*일산(?:불교)?병원\s*약제팀\s*$/gm, '')
            .replace(/^##\s+((?:\d{1,2}\)|[가-힣]\.|[①②③④⑤⑥⑦⑧⑨⑩]|▶|\*\s*주의|최종\s*검토일|최근\s*검토일|최신\s*검토일)[^\n]*)$/gm, '$1');

        for (let i = 0; i < 3; i += 1) {
            normalized = normalized.replace(/([^\n\-*])\s+((?:\d{1,2}\)|[①②③④⑤⑥⑦⑧⑨⑩]|▶)\s+)/g, '$1\n\n$2');
        }

        return normalized
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    function normalizeEditorMarkup(markdown) {
        return normalizeImportedDocumentMarkup(normalizeImageMarkup(normalizeFontMarkup(markdown)));
    }

    function renderFontSizeMarkup(markdown) {
        return renderImageMarkup(normalizeEditorMarkup(markdown))
            .replace(/\\?<span style="font-size:\s*(12|14|16|18|20|24|28|32)px;">([\s\S]*?)\\?<\/span\\?>/g, '<span style="font-size: $1px;">$2</span>')
            .replace(/\[font size="(12|14|16|18|20|24|28|32)"\]([\s\S]*?)\[\/font\]/g, '<span style="font-size: $1px;">$2</span>');
    }

    function normalizeCategory(category) {
        return String(category || '').normalize('NFC').trim();
    }

    function getDocCategory(doc) {
        return normalizeCategory(doc.category);
    }

    cancelBtn.addEventListener('click', () => {
        editorContainer.classList.add('hidden');
        markdownContent.classList.remove('hidden');
        editBtn.style.display = isLearningPreview ? 'none' : 'flex';
    });

    saveBtn.addEventListener('click', async () => {
        const newContent = normalizeEditorMarkup(editor.getMarkdown());
        const doc = documentsData.find(d => d.id === activeDocId);
        doc.content = newContent;
        
        const originalSaveText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 저장 중...';
        saveBtn.disabled = true;

        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: activeDocId, content: newContent })
            });
            
            if (response.ok) {
                alert('저장되었습니다.\n실행앱에 반영하려면 수동 업데이트 절차로 수동업데이트_실행기.bat를 실행해 주세요.');
                editorContainer.classList.add('hidden');
                markdownContent.classList.remove('hidden');
                editBtn.style.display = isLearningPreview ? 'none' : 'flex';
                viewDocument(doc); // Re-render the view
            } else {
                alert('저장에 실패했습니다. 로컬 서버(앱_실행하기.bat)로 열었는지 확인하세요.');
            }
        } catch (e) {
            alert(e.message || '서버 연결 오류. 로컬 서버(앱_실행하기.bat)로 열었는지 확인하세요.');
            console.error(e);
        } finally {
            saveBtn.innerHTML = originalSaveText;
            saveBtn.disabled = false;
        }
    });

    function updateHighlightSelection() {
        if (highlightElements.length === 0) return;

        // Remove active class from all
        highlightElements.forEach(el => el.classList.remove('active-highlight'));

        // Add to current
        const currentEl = highlightElements[currentHighlightIndex];
        currentEl.classList.add('active-highlight');

        // Update text
        matchCount.textContent = `${currentHighlightIndex + 1} / ${highlightElements.length}`;

        // Scroll
        setTimeout(() => {
            const container = document.querySelector('.main-content');
            const highlightPos = currentEl.offsetTop;
            container.scrollTo({ top: highlightPos - 60, behavior: 'smooth' });
        }, 50);
    }

    // Helper for regex
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    // Run
    init();
});
