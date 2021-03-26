function searchToggle(obj, evt) {
    var container = $(obj).closest('.search_wrapper');
    if(!container.hasClass('active')){
        container.addClass('active');
        evt.preventDefault();
    } else if(container.hasClass('active') && $(obj).closest('.input_holder').length == 0){
        container.removeClass('active');
        // clear input
        container.find('.search_input').val('');
    }
}