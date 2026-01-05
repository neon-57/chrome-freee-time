// ダイアログが表示されたら勤怠時間を計算して表示する
function observeDialogAppearance() {
    let isProcessing = false;
    let processingTimeout = null;
    let dialogWasVisible = false; // ダイアログの表示状態を記録するフラグ

    const observer = new MutationObserver(() => {
        // 処理中なら新しい変更は無視
        if (isProcessing) return;

        // スロットリングによる過剰な処理防止
        clearTimeout(processingTimeout);
        processingTimeout = setTimeout(() => {
            const dialog = document.querySelector('.vb-dialogBase.vb-dialogBase--paddingZero');

            // ダイアログの表示状態変化を検出
            const dialogIsVisible = !!dialog;

            // 新しくダイアログが表示された場合のみ処理を実行
            if (dialogIsVisible && !dialogWasVisible) {
                isProcessing = true;
                dialogWasVisible = true;

                // 時間記録と表示の処理
                processTimeRecords();

                isProcessing = false;
            } else if (!dialogIsVisible && dialogWasVisible) {
                // ダイアログが非表示になったらフラグをリセット
                dialogWasVisible = false;
            }
        }, 200);
    });

    // 時間を計算して表示する関数
    function processTimeRecords() {
        try {
            const texts = document.querySelectorAll('.vb-tableListRow .vb-tableListCell__text');

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

            for (let i = 0; i < texts.length; i += 4) {
                const text = texts[i].textContent;
                const timeInput = texts[i + 2].querySelector("input");
                if (!timeInput) continue;

                const time = timeInput.value;

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
            if (!startTime) return; // 出勤記録がなければ何もしない

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
            const taskDialog = document.querySelector('.vb-taskDialog__body');
            if (!taskDialog) return;

            // 既存のタグを削除
            const existingTag = taskDialog.querySelector('.time-display-tag');
            if (existingTag) {
                existingTag.remove();
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
            // console.error('Error processing time records:', error);
        }
    }

    // DOM変更の監視を開始
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// ページ読み込み時に監視を開始
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeDialogAppearance);
} else {
    observeDialogAppearance();
}