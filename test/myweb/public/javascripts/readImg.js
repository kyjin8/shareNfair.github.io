function readImg(input){
    console.log('input')
    var reader = new FileReader();
    reader.onload = function (e){
        $('#previewProfile').attr('src',e.target.result);
    }
    reader.readAsDataURL(input.files[0]);
}