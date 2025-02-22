function notesEdit(path, content) {
    createWindow('Edit', `
        <div class="notes-app">
            <textarea autofocus class="notes-content" id="notes-edit-content" placeholder="Start typing...">${content}</textarea>
        </div>
    `, 400, 300);
    const newHeaderButton = document.createElement('div');
    newHeaderButton.classList = ["control-button", "minimize"]; // "minimize" is the extra button.
    newHeaderButton.innerHTML = "💾";
    newHeaderButton.onmouseover = () => controlButtonEnter();
    newHeaderButton.onmouseleave = () => controlButtonOut();
    newHeaderButton.addEventListener('click', () => {
        const content = document.querySelector('#notes-edit-content').value;
        fetch('http://' + window.location.host.split(':')[0] + ":9091" + `/api/file_manager/write`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                path: path,
                content: content
            }),
        });
    });
    document.querySelector('.edit-controls').appendChild(newHeaderButton);
}