$(document).ready(function() {
    console.log("indexjs working")
    $.getJSON('fileList.json', function(data) {

        var row = 1;

        data.forEach(finfo => {
            var tr = $('<tr>');
            var calsize;

            if ((finfo.size / 1024) < 1024) {
                calsize = (finfo.size / 1024).toFixed(2) + " KB";
            } else if ((finfo.size / 1024 / 1024) < 1024) {
                calsize = (finfo.size / 1024 / 1024).toFixed(2) + " MB";
            } else {
                calsize = (finfo.size / 1024 / 1024 / 1024).toFixed(2) + " GB"
            }

            tr.append("<td>" + (row++) + "</td>")
            tr.append("<td>" + finfo.name + "</td>");
            tr.append("<td>" + calsize + "</td>");
            tr.append("<td>" + `<input type="checkbox" value="${finfo.name}" class="click">` + "</td>");
            $("tbody").append(tr);
        })
    })

    $('#clickall').on('click', function() {
        $('input:checkbox').not(this).prop('checked', this.checked);
        console.log(this)
    })

    $('#download-btn').on('click', function(event) {
        event.preventDefault();
        let downloadlist = [];
        $('.click').each(function(index, element) {
            if ($(element).prop('checked')) {
                downloadlist.push($(element).val())
            }
        })
        let path = "http://localhost:1227/download/"

        downloadlist.forEach(file => {
            let downloadpath = path + file;
            window.open(downloadpath);

        })
    })

    $('#remove-btn').on('click', function(event) {
        event.preventDefault();
        let removelist = { idlist: [] };
        $('.click').each(function(index, element) {
            if ($(element).prop('checked')) {
                removelist.idlist.push($(element).val())
            }
        })
        let rpath = "http://localhost:1227/remove"

        $.post(rpath, removelist, function(event) {
            event.preventDefault();
            console.log("removelist sent")
        }, "json")


        window.location.replace('http://localhost:1227/');

    })

})