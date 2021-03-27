const removeart = (btn, tableId) => {
    const input = btn.getElementsByTagName("input");

    fetch('/author/deletearticle?id=' + input[0].value, {
        method: 'DELETE',
        headers: {
            'csrf-token': input[1].value
        }
    })
    .then(msg => {
        return msg.json();
    })
    .then(data => {
        if(data.msg === 'success'){
            document.getElementById(tableId).deleteRow(btn.parentNode.parentNode.rowIndex);
        }
        else console.log(data.msg);
    })
    .catch(err => console.log(err));
    console.log(input);
}