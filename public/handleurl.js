const Dom = {
    MP3_Btn: document.getElementById('downloadmp3btn'),
    URL: document.getElementById('urlinput'),
    // Progess: document.getElementById('progessbar_inner')
}

Dom.URL.focus();

let canclickdownload = true;

// Error handling for URL input
function HandleURL() {
    if (Dom.URL.value === '') {
        alert('連結不得為空');
        return false;
    }
    if (Dom.URL.value.indexOf('youtube') === -1 && Dom.URL.value.indexOf('youtu.be') === -1) {
        alert('請輸入 YouTube 影片連結');
        return false;
    }else if(Dom.URL.value.includes('list=')){
        alert('暫不支援下載播放清單');
        return false;
    }
    return true;
}

Dom.MP3_Btn.onclick = async () => {
    if (!canclickdownload) {
        return;
    }
    const URL = Dom.URL.value;
    try {
        if (!HandleURL()) {
            return;
        }
        Dom.MP3_Btn.innerText = '下載中...';
        Dom.MP3_Btn.classList.add('blocked')
        canclickdownload = false;

        const res = await fetch('/downloadmp3', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ URL }),
        });

        if (res.ok) {
            Dom.URL.value = ''; // Clear input field
            canclickdownload = true;
            Dom.MP3_Btn.innerText = '下載MP3';
            Dom.MP3_Btn.classList.remove('blocked')
            const blob = await res.blob(); // Convert to blob for download
            const a = document.createElement('a');
            a.href = window.URL.createObjectURL(blob);

            // Extract filename from headers
            const contentDisposition = res.headers.get('Content-Disposition');
            let fileName = '';
            //對filename進行url解碼轉換
            if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
                fileName = decodeURIComponent(contentDisposition.split('filename*=UTF-8\'\'')[1]);
            }
            //如果filename為空，則使用預設的檔名

            if (fileName === '') {
                fileName = 'download.mp3';
            }
            a.download = fileName;

            a.click();
        } else {
            alert('下載失敗');
        }

    } catch (error) {
        console.log(error);
    }
}

