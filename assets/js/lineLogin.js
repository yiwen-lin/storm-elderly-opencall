(function ($) {
    window.urlParam = [];

    window.token = '';
    window.lineCode = '';
    window.lineRedirectUri = location.protocol + '//' + location.host + location.pathname + window.location.hash;
    window.lineId = '1657294682';
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

    $(document).on('click', '[data-js="voteBtn"][data-vote-type="true"]', function () {
        let target = $(this).closest('[data-js="vote"]');
        let story = target.attr('data-vote-id');
        let type = target.find('[data-js="voteBtn"]').attr('data-vote-type');

        _voteEnd(target);
        if ('false' == type) {
            alert('今天已參加過投票，請隔日再蒞臨參加。');
        } else if ((undefined !== story && '' != story)) {
            toGetLineUser(story, target);
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

        $.ajax({
            type: "POST",
            dataType: "JSON",
            url: url,
            data: JSON.stringify(data),
            beforeSend: function () {
            },
            success: function (res) {
                if (true == res.isSuccess && '' != res.no) {
                    let countTarget = target.find('[data-js="voteCount"]');
                    let count = parseInt(countTarget.text());
                    countTarget.text(count + 1);
                    Swal.fire({
                        title: "投票成功",
                        icon: "success"
                    });
                } else {
                    alert('今天已參加過投票，請隔日再蒞臨參加。');
                }
            },
            complete: function () {
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

        let target = $('[data-js="vote"]');

        if (0 < target.length) {
            $.ajax({
                type: "POST",
                dataType: "JSON",
                url: url,
                data: JSON.stringify(data),
                beforeSend: function () {
                },
                success: function (res) {
                    if (res) {
                        target.each(function () {
                            let voteId = $(this).attr('data-vote-id');
                            $(this).find('[data-js="voteCount"]').text(0);
                            $(this).find('[data-js="voteBtn"]').attr('data-vote-type', 'true');
                            if (undefined !== voteId && undefined !== res[voteId] && null !== res[voteId]) {
                                $(this).find('[data-js="voteCount"]').text(res[voteId]);
                            }
                        });
                    }
                },
                complete: function () {
                },
                error: function () {
                }
            });
        }
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
    target.find('[data-js="voteBtn"]')
        .addClass('text-folio-voted')
        .attr('data-vote-type', 'false');
    target.find('[data-js="voteText"]').html('今日已投票');
}