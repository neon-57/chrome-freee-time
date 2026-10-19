// ダイアログが表示されたら勤怠時間を計算して表示する
function observeDialogAppearance() {
    let processingTimeout = null;
    // freeeのCSS Modules移行後も、互換用の属性で同じ要素を取得する。
    const dialogSelector = '.vb-dialogBase, [data-deprecated-class~="vb-dialogBase"]';
    const bodySelector = '.vb-taskDialog__body, [data-deprecated-class~="vb-taskDialog__body"]';

    function scheduleUpdate() {
        clearTimeout(processingTimeout);
        processingTimeout = setTimeout(() => {
            for (const dialog of document.querySelectorAll(dialogSelector)) {
                processTimeRecords(dialog);
            }
        }, 200);
    }

    const observer = new MutationObserver(scheduleUpdate);

    // 時間を計算して表示する関数
    function processTimeRecords(dialog) {
        try {
            const taskDialog = dialog.querySelector(bodySelector);
            if (!taskDialog) return;
            const existingTag = taskDialog.querySelector('.time-display-tag');

            // 時間文字列（HH:mm）を分に変換する関数
            function timeToMinutes(timeStr) {
                if (!timeStr || timeStr === '') return 0;
                const [hours, minutes] = timeStr.split(':').map(Number);
                return hours * 60 + minutes;
            }

            // 分を時間文字列（HH:mm）に変換する関数
            function minutesToTime(minutes) {
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
            }

            // 5分単位で切り捨て（休憩開始用）
            function roundDownTo5Minutes(minutes) {
                return Math.floor(minutes / 5) * 5;
            }

            // 5分単位で切り上げ（休憩終了用）
            function roundUpTo5Minutes(minutes) {
                return Math.ceil(minutes / 5) * 5;
            }

            // 現在時刻を分に変換
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();

            // 勤怠データの収集
            let startTime = "";
            let endTime = "";
            let breakStartTimes = [];
            let breakEndTimes = [];

            // 行ごとに読み取り、ダイアログ外の表や変更理由の入力を混ぜない。
            for (const row of taskDialog.querySelectorAll('tbody tr')) {
                const cells = row.querySelectorAll('td');
                const text = cells[0]?.textContent.trim();
                const timeInput = row.querySelector('input[name^="time_clocks["][name$=".datetime"]')
                    || cells[2]?.querySelector('input');
                if (!timeInput) continue;

                const time = timeInput.value.trim();
                if (!['出勤', '退勤', '休憩開始', '休憩終了'].includes(text)) continue;
                // 編集途中の値からNaNや不正な集計を表示しない。
                if (!/^\d{1,2}:[0-5]\d$/.test(time)) {
                    existingTag?.remove();
                    return;
                }

                if (text === "出勤") {
                    startTime = time;
                } else if (text === "休憩開始") {
                    breakStartTimes.push(time);
                } else if (text === "休憩終了") {
                    breakEndTimes.push(time);
                } else if (text === "退勤") {
                    endTime = time;
                }
            }

            // 勤務時間の計算
            if (!startTime) {
                existingTag?.remove();
                return;
            }

            const startMinutes = timeToMinutes(startTime);
            const endMinutes = endTime ? timeToMinutes(endTime) : currentMinutes;
            const totalWorkMinutes = endMinutes - startMinutes;

            // 休憩時間の計算（5分単位で丸め）
            let totalBreakMinutes = 0;
            for (let i = 0; i < breakStartTimes.length; i++) {
                const breakStart = roundDownTo5Minutes(timeToMinutes(breakStartTimes[i]));
                const breakEnd = (i < breakEndTimes.length) ?
                    roundUpTo5Minutes(timeToMinutes(breakEndTimes[i])) :
                    roundUpTo5Minutes(currentMinutes);
                totalBreakMinutes += (breakEnd - breakStart);
            }

            // 実労働時間
            const actualWorkMinutes = totalWorkMinutes - totalBreakMinutes;

            // 表示文字列の作成
            let showText = `総勤務時間: ${minutesToTime(totalWorkMinutes)} (${Math.floor(totalWorkMinutes / 60)}時間${totalWorkMinutes % 60}分)\n`;

            if (breakStartTimes.length > 0) {
                showText += `休憩時間: ${minutesToTime(totalBreakMinutes)} (${Math.floor(totalBreakMinutes / 60)}時間${totalBreakMinutes % 60}分)\n`;
            }

            showText += `実労働時間: ${minutesToTime(actualWorkMinutes)} (${Math.floor(actualWorkMinutes / 60)}時間${actualWorkMinutes % 60}分)`;

            if (endTime) {
                showText += `\n退勤: ${endTime}`;
            }

            // 表示処理
            // 同じ内容は書き直さず、自身のDOM更新による監視ループを防ぐ。
            if (existingTag) {
                if (existingTag.textContent !== showText) existingTag.textContent = showText;
                return;
            }

            // 新しいタグを追加
            const p = document.createElement('p');
            p.textContent = showText;
            p.className = 'time-display-tag';
            p.style.whiteSpace = 'pre-line';
            p.style.fontWeight = 'bold';
            p.style.marginTop = '10px';
            p.style.padding = '10px';
            p.style.backgroundColor = '#f5f5f5';
            p.style.borderRadius = '5px';
            taskDialog.appendChild(p);
        } catch (error) {
            console.warn('Chrome Freee Time: 勤怠時間を取得できませんでした。', error);
        }
    }

    // DOM変更の監視を開始
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
    document.addEventListener('input', scheduleUpdate);
    document.addEventListener('change', scheduleUpdate);
    // 拡張機能の起動前に開かれていたダイアログも処理する。
    scheduleUpdate();
}

// ページ読み込み時に監視を開始
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeDialogAppearance);
} else {
    observeDialogAppearance();
}
