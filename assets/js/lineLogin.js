(function ($) {
    window.urlParam = [];

    window.token = '';
    window.lineCode = '';
    window.lineId = '1657294682';
    // window.lineRedirectUri = 'http://storm-elderly-opencall.tet:8080/lineLogin.html';
    window.lineRedirectUri = location.protocol + '//' + location.host + location.pathname;
    window.lineChannelSecret = '76af0068c610f74ca8d1539dd98d9f92';

    window.onload = function () {
        let url = location.href;

        if(-1 != url.indexOf('?'))
        {
            let ary1 = url.split('?');
            let ary2 = ary1[1].split('&');

            for(var i in ary2) {
                let a = ary2[i].split('=');
                window.urlParam[a[0]] = a[1]
            }
        }

        toGet();
    };

    $(document).on('click', '[data-js="toVote"]', function () {
        let target = $(this);
        let story = $(this).data('id');
        let type = $(this).attr('data-type');

        if ('end' == type) {
            alert('今天已參加過投票，請隔日再蒞臨參加。');
            _voteEnd(target);
        } else if ((undefined !== story && '' != story)) {
            toGetLineUser(story, $(this));
        }
    });

    function toLoginLineUser() {
        let url = 'https://access.line.me/oauth2/v2.1/authorize?';
        url += 'response_type=code';
        url += '&client_id=' + window.lineId;
        url += '&redirect_uri=' +  window.lineRedirectUri;
        url += '&state=login';
        url += '&scope=openid%20profile%20email';
        window.location.href = url;
    }

    function toGetLineUser(story, target) {
        let url = 'https://api.line.me/oauth2/v2.1/token';

        for (let i in window.urlParam) {
            if ('code' == i) {
                window.lineCode = window.urlParam[i];
            }
        }

        if ('' != window.token) {
            let data = jwt_decode(window.token);

            data.story = story;
            data.type = 'save';
            toSave(data, target);
            _voteEnd(target);
        } else {
            let data = {
                grant_type: 'authorization_code' ,
                code: window.lineCode,
                redirect_uri: window.lineRedirectUri,
                client_id: window.lineId,
                client_secret: window.lineChannelSecret,
            };

            var formBody = getFormUrlencoded(data);

            $.ajax({
                type: "POST",
                dataType: "JSON",
                url: url,
                data: formBody,
                beforeSend: function () {
                },
                success: function (res) {
                    let token = res.id_token;
                    window.token = token;
                    let data = jwt_decode(token);

                    data.story = story;
                    data.type = 'save';
                    toSave(data, target);
                    _voteEnd(target);
                },
                complete: function () {
                },
                error: function (res) {
                    if (400 == res.status) {
                        toLoginLineUser();
                    }
                }
            });
        }
    }

    function toSave(data, target) {
        let url = 'https://script.google.com/macros/s/AKfycbzvJcCZETu26rVunk3uWC6VOCns8QPU1Um_L0vy2VC5Zj2xd9uGYNtjUBu_4sW8IaSA/exec';

        var SHARE_LINK_URL = window.location.href;
        var SHARE_LINK_TEXT = '大地男力';

        $.ajax({
            type: "POST",
            dataType: "JSON",
            url: url,
            data: JSON.stringify(data),
            beforeSend: function () {
            },
            success: function (res) {
                if (true == res.isSuccess && '' != res.no) {
                    var confirmButtonText = '<a href="'
                        + 'https://www.facebook.com/sharer.php?u='
                        + SHARE_LINK_URL + '&quote='
                        + SHARE_LINK_TEXT
                        + '" target="_blank">分享</a>'
                    alert('投票成功');
                    // Swal.fire({
                    //     title: "投票成功",
                    //     text: "分享到FB，讓女力故事激勵更多人",
                    //     icon: "success",
                    //     showCancelButton: true,
                    //     cancelButtonText: '取消',
                    //     confirmButtonText: confirmButtonText,
                    // });
                } else {
                    alert('今天已參加過投票，請隔日再蒞臨參加。');
                }
            },
            complete: function () {
                target.addClass('text-folio-voted');
                target.find('a').html('今日已投票')
            },
            error: function (res) {
            }
        });
    }

    function toGet() {
        let url = 'https://script.google.com/macros/s/AKfycbzvJcCZETu26rVunk3uWC6VOCns8QPU1Um_L0vy2VC5Zj2xd9uGYNtjUBu_4sW8IaSA/exec';

        var data = {
            type: 'getData',
        };

        $.ajax({
            type: "POST",
            dataType: "JSON",
            url: url,
            data: JSON.stringify(data),
            beforeSend: function () {
            },
            success: function (res) {
                if (res) {
                    for(let i in res) {
                        let target = $('[data-js="getVote"][data-id="' + i + '"]');
                        console.log();
                        if (target.length > 0) {
                            target.html(res[i]);
                        }
                    }
                }
            },
            complete: function () {
            },
            error: function (res) {
            }
        });
    }

    function getFormUrlencoded(data) {
        var formBody = [];

        for (let i in data) {
            var encodedKey = encodeURIComponent(i);
            var encodedValue = encodeURIComponent(data[i]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        return formBody.join("&");
    }
})(jQuery);

function _voteEnd(target) {
    target.attr('data-type', 'end');
}