export type Language = 'ja' | 'en' | 'ko'

export type TranslationKey =
    | 'title'
    | 'weddingDate'
    | 'venue'
    | 'lastUpdated'
    | 'addNewTask'
    | 'viewCalendar'
    | 'updateData'
    | 'addCategory'
    | 'manageMembers'
    | 'menu'
    | 'close'
    | 'taskName'
    | 'category'
    | 'assignedMember'
    | 'dueDate'
    | 'notes'
    | 'addTask'
    | 'selectCategory'
    | 'selectAssignee'
    | 'shortMemo'
    | 'selectFromCalendar'
    | 'myTaskList'
    | 'noTasksYet'
    | 'addFromForm'
    | 'categoryName'
    | 'icon'
    | 'themeColor'
    | 'currentMembers'
    | 'noMembers'
    | 'edit'
    | 'delete'
    | 'addNewMember'
    | 'memberName'
    | 'role'
    | 'email'
    | 'lineId'
    | 'addMember'
    | 'editMember'
    | 'update'
    | 'cancel'
    | 'pleaseEnter'
    | 'alreadyExists'
    | 'confirmDelete'
    | 'taskNameAndCategoryRequired'
    | 'pleaseEnterCategoryName'
    | 'sameCategoryExists'
    | 'pleaseEnterMemberName'
    | 'sameMemberExists'
    | 'loadingData'
    | 'errorOccurred'
    | 'reloadPage'
    | 'items'

export const translations: Record<Language, Record<TranslationKey, string>> = {
    ja: {
        title: 'Task Bouquet',
        weddingDate: '挙式日：2026年5月2日（土）',
        venue: '式場：アニヴェルセルみなとみらい',
        lastUpdated: '最終更新',
        addNewTask: '新しいタスクを追加',
        viewCalendar: 'カレンダーを見る',
        updateData: 'データを更新',
        addCategory: 'カテゴリを追加',
        manageMembers: 'メンバー管理',
        menu: 'メニュー',
        close: '閉じる',
        taskName: 'タスク名',
        category: 'カテゴリ',
        assignedMember: '担当メンバー',
        dueDate: '期限',
        notes: 'ノート',
        addTask: 'タスクを追加',
        selectCategory: 'カテゴリを選択',
        selectAssignee: '担当者を選択',
        shortMemo: 'メモを短く残せます',
        selectFromCalendar: 'カレンダーから選択',
        myTaskList: 'マイタスクリスト',
        noTasksYet: 'まだタスクはありません。上のフォームから追加してみましょう',
        addFromForm: '上のフォームから追加してみましょう',
        categoryName: 'カテゴリ名',
        icon: 'アイコン',
        themeColor: 'テーマカラー',
        currentMembers: '現在のメンバー',
        noMembers: 'メンバーがまだいません',
        edit: '編集',
        delete: '削除',
        addNewMember: '新しいメンバーを追加',
        memberName: 'メンバー名',
        role: '役割',
        email: 'メール',
        lineId: 'LINE ID',
        addMember: 'メンバーを追加',
        editMember: 'メンバーを編集',
        update: '更新',
        cancel: 'キャンセル',
        pleaseEnter: 'を入力してください',
        alreadyExists: '同じ{item}が存在します',
        confirmDelete: '{item}を削除しますか？',
        taskNameAndCategoryRequired: 'タスク名とカテゴリを入力してください',
        pleaseEnterCategoryName: 'カテゴリ名を入力してください',
        sameCategoryExists: '同じカテゴリ名が存在します',
        pleaseEnterMemberName: 'メンバー名を入力してください',
        sameMemberExists: '同じメンバー名が存在します',
        loadingData: 'データを読み込み中...',
        errorOccurred: 'エラーが発生しました',
        reloadPage: 'ページを再読み込み',
        items: '件'
    },
    en: {
        title: 'Task Bouquet',
        weddingDate: 'Wedding Date: May 2, 2026 (Sat)',
        venue: 'Venue: ANNIVERSAIRE MINATOMIRAI',
        lastUpdated: 'Last Updated',
        addNewTask: 'Add New Task',
        viewCalendar: 'View Calendar',
        updateData: 'Update Data',
        addCategory: 'Add Category',
        manageMembers: 'Manage Members',
        menu: 'Menu',
        close: 'Close',
        taskName: 'Task Name',
        category: 'Category',
        assignedMember: 'Assigned Member',
        dueDate: 'Due Date',
        notes: 'Notes',
        addTask: 'Add Task',
        selectCategory: 'Select Category',
        selectAssignee: 'Select Assignee',
        shortMemo: 'Add a short memo',
        selectFromCalendar: 'Select from Calendar',
        myTaskList: 'My Task List',
        noTasksYet: 'No tasks yet. Try adding one from the form above',
        addFromForm: 'Try adding one from the form above',
        categoryName: 'Category Name',
        icon: 'Icon',
        themeColor: 'Theme Color',
        currentMembers: 'Current Members',
        noMembers: 'No members yet',
        edit: 'Edit',
        delete: 'Delete',
        addNewMember: 'Add New Member',
        memberName: 'Member Name',
        role: 'Role',
        email: 'Email',
        lineId: 'LINE ID',
        addMember: 'Add Member',
        editMember: 'Edit Member',
        update: 'Update',
        cancel: 'Cancel',
        pleaseEnter: 'Please enter',
        alreadyExists: 'Same {item} already exists',
        confirmDelete: 'Delete {item}?',
        taskNameAndCategoryRequired: 'Please enter task name and category',
        pleaseEnterCategoryName: 'Please enter category name',
        sameCategoryExists: 'Same category name already exists',
        pleaseEnterMemberName: 'Please enter member name',
        sameMemberExists: 'Same member name already exists',
        loadingData: 'Loading data...',
        errorOccurred: 'An error occurred',
        reloadPage: 'Reload Page',
        items: 'items'
    },
    ko: {
        title: 'Task Bouquet',
        weddingDate: '결혼식 날짜: 2026년 5월 2일 (토)',
        venue: '장소: 아니베르셀 미나토미라이',
        lastUpdated: '마지막 업데이트',
        addNewTask: '새 작업 추가',
        viewCalendar: '캘린더 보기',
        updateData: '데이터 업데이트',
        addCategory: '카테고리 추가',
        manageMembers: '멤버 관리',
        menu: '메뉴',
        close: '닫기',
        taskName: '작업명',
        category: '카테고리',
        assignedMember: '담당 멤버',
        dueDate: '마감일',
        notes: '메모',
        addTask: '작업 추가',
        selectCategory: '카테고리 선택',
        selectAssignee: '담당자 선택',
        shortMemo: '간단한 메모를 남겨보세요',
        selectFromCalendar: '캘린더에서 선택',
        myTaskList: '내 작업 목록',
        noTasksYet: '아직 작업이 없습니다. 위 폼에서 추가해보세요',
        addFromForm: '위 폼에서 추가해보세요',
        categoryName: '카테고리명',
        icon: '아이콘',
        themeColor: '테마 색상',
        currentMembers: '현재 멤버',
        noMembers: '아직 멤버가 없습니다',
        edit: '편집',
        delete: '삭제',
        addNewMember: '새 멤버 추가',
        memberName: '멤버명',
        role: '역할',
        email: '이메일',
        lineId: 'LINE ID',
        addMember: '멤버 추가',
        editMember: '멤버 편집',
        update: '업데이트',
        cancel: '취소',
        pleaseEnter: '을(를) 입력해주세요',
        alreadyExists: '동일한 {item}이(가) 존재합니다',
        confirmDelete: '{item}을(를) 삭제하시겠습니까?',
        taskNameAndCategoryRequired: '작업명과 카테고리를 입력해주세요',
        pleaseEnterCategoryName: '카테고리명을 입력해주세요',
        sameCategoryExists: '동일한 카테고리명이 존재합니다',
        pleaseEnterMemberName: '멤버명을 입력해주세요',
        sameMemberExists: '동일한 멤버명이 존재합니다',
        loadingData: '데이터 로딩 중...',
        errorOccurred: '오류가 발생했습니다',
        reloadPage: '페이지 새로고침',
        items: '개'
    }
}

export const languageNames: Record<Language, string> = {
    ja: '日本語',
    en: 'English',
    ko: '한국어'
}