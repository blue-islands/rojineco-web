/*
 * タイトル：インデックス画面JS
 * 説明    ：
 * 著作権  ：Copyright(c) 2019 rojineco project.
 * 会社名  ：ロジネコプロジェクト
 * 変更履歴：2019.05.16
 *        ：新規登録
 */
//34567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890
var IndexCtrl = {};
//+----- ↓定数・変数の設定ココから -----------------------------------------------------------------+
IndexCtrl.domain = 'https://www.livlog.xyz/webapi/';
// IndexCtrl.domain = 'http://localhost:8080/';
IndexCtrl = {
    _className: 'IndexCtrl',
    SESSION_UUID: "SESSION_UUID",
    CHANGE_DISTANCE: 50000,
    RANGE_DISTANCE: 20000,
    GET_DISTANCE: 100,
    userId: null,
    mymap: null,
    lat: 0,
    lng: 0,
    changeLat: 0,
    changeLng: 0,
    rangeLat: 0,
    rangeLng: 0,
    nostalgy: null,
    myMarker: null,
    markers:[],
    comments: [],
    autoF: true,
    urls: {
        login: IndexCtrl.domain + 'login',
        who: IndexCtrl.domain + 'who',
        getNostalgy: IndexCtrl.domain + 'getNostalgy',
        setComment: IndexCtrl.domain + 'setComment',
        getComment: IndexCtrl.domain + 'getComment',
        removeComment: IndexCtrl.domain + 'removeComment',
    },
    mapIcon: {
        my: L.icon({
            iconUrl: './img/walk_back.gif',
            iconRetinaUrl: './img/walk_back.gif',
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36],
        }),
        gold: L.icon({
            iconUrl: './img/npc1.png',
            iconRetinaUrl: './img/npc1.png',
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36],
        }),
        silver: L.icon({
            iconUrl: './img/npc2.png',
            iconRetinaUrl: './img/npc2.png',
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36],
        }),
        bronze: L.icon({
            iconUrl: './img/npc3.png',
            iconRetinaUrl: './img/npc3.png',
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36],
        }),
        comment: L.icon({
            iconUrl: './img/comment.png',
            iconRetinaUrl: './img/comment.png',
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36],
        }),
    },

//+----- ↓functionの記述ココから -----------------------------------------------------------------+
    init: function UN_init() {
        var _functionName = 'UN_init';

        try {
            Util.startWriteLog(IndexCtrl._className,_functionName);
            // 処理開始
            // UUIDの取得
            IndexCtrl.userId = localStorage.getItem(IndexCtrl.SESSION_UUID);
            if (IndexCtrl.userId == null) {
                IndexCtrl.userId = Util.uuid();
                localStorage.setItem(IndexCtrl.SESSION_UUID, IndexCtrl.userId);
            }

            IndexCtrl.dispSize();
            $(window).resize(function() {
                //リサイズされたときの処理
                IndexCtrl.dispSize();
            });

            // 自動ボタン
            $(document).on('click', '#doAuto', function() {
                // clickイベントの処理
                IndexCtrl.auto();
            });
            // 設定ボタン
            $(document).on('click', '#doSetting', function() {
                // clickイベントの処理
            });
            // 状態ボタン
            $(document).on('click', '#doStatus', function() {
                // clickイベントの処理
            });
            // コメントボタン
            $(document).on('click', '#doComment', function() {
                // clickイベントの処理
                $('#commentView').show();
                $('#doCommentEntry').show();
                $('#doCommentDelete').hide();
                $('#doCommentOk').hide();
                $('#doCommentCancel').show();
                $('#commentField').removeClass('is-error');
                $('#commentField').prop('readOnly', false);
                $('#commentField').val('');
                $('#commentLat').val(IndexCtrl.lat);
                $('#commentLng').val(IndexCtrl.lng);
                $('#commentId').val('');
            });
            // コメント登録ボタン
            $(document).on('click', '#doCommentEntry', function() {
                // clickイベントの処理
                var comment = $('#commentField').val();
                var lat = $('#commentLat').val();
                var lng = $('#commentLng').val();
                var uuid = $('#commentId').val();
                if (uuid.length == 0) {
                    uuid = null;
                }
                if (comment.length == 0) {
                    $('#commentField').addClass('is-error');     
                } else {
                    IndexCtrl.setComment(uuid, lat, lng, comment);
                }
            });
            // コメント削除ボタン
            $(document).on('click', '#doCommentDelete', function() {
                // clickイベントの処理
                var comment = $('#commentField').val();
                var lat = $('#commentLat').val();
                var lng = $('#commentLng').val();
                var uuid = $('#commentId').val();
                if (uuid.length == 0) {
                    uuid = null;
                }
                IndexCtrl.removeComment(uuid);
            });
            // コメントOKボタン
            $(document).on('click', '#doCommentOk', function() {
                // clickイベントの処理
                $('#commentView').hide();
            });
            // コメントキャンセルボタン
            $(document).on('click', '#doCommentCancel', function() {
                // clickイベントの処理
                $('#commentView').hide();
            });
            
            // ビューの非表示
            $('#commentView').hide();
            $('#catView').hide();

            IndexCtrl.mymap = L.map('mymap',{
                center: [35.7102, 139.8132],
                zoom: 13,
                zoomControl: false // default true
            })
         
            // L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            //     attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            //     maxZoom: 18,
            //     id: 'mapbox.streets',
            //     accessToken: 'pk.eyJ1IjoiaGFvc2hpbWEiLCJhIjoiY2lsODJuMjNoMDlhbnZ0a3IxaGw0NDhqOSJ9.HrD7j0q54v_vOseYNVLeEg' //ここにaccess tokenを挿入
            // }).addTo(IndexCtrl.mymap);
            L.tileLayer('https://{s}.tile.thunderforest.com/pioneer/{z}/{x}/{y}.png?apikey={apikey}', {
                attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                apikey: 'ed224a20677d4dd1a89710617d85df19',
                maxZoom: 22
            }).addTo(IndexCtrl.mymap);

            var options = {
                enableHighAccuracy: true,
                timeout: 60000,
                maximumAge: 0
            };
            // 位置情報取得
            window.navigator.geolocation.watchPosition(IndexCtrl.success, IndexCtrl.error, options);
            // 処理終了
        }
        catch (ex) {
            logger.error(ex);
        }
        finally {
            Util.endWriteLog(IndexCtrl._className,_functionName);
        }
    },

    success: function UN_success(pos) {
        var _functionName = 'UN_success',
            _changeDistance = 0,
            _rangeDistance = 0,
            _lat = 0,
            _lng = 0,
            _myIcon = null;

        try {
            Util.startWriteLog(IndexCtrl._className,_functionName);
            // 処理開始
            // 緯度
            logger.info('latitude:' + pos.coords.latitude);
            // $('#latitude').val(pos.coords.latitude);
            // 経度
            logger.info('longitude:' + pos.coords.longitude);
            // $('#longitude').val(pos.coords.longitude);
            // 移動方向
            logger.info('heading:' + pos.coords.heading);
            // $('#heading').val(pos.coords.heading);
            // 移動速度
            logger.info('speed:' + pos.coords.speed);
            // $('#speed').val(pos.coords.speed);

            _lat = pos.coords.latitude; //緯度
            _lng = pos.coords.longitude; //経度
            IndexCtrl.lat = _lat;
            IndexCtrl.lng = _lng;
            _changeDistance = geolib.getDistance(
                {latitude: _lat, longitude: _lng},
                {latitude: IndexCtrl.changeLat, longitude: IndexCtrl.changeLng}
            );
            _rangeDistance = geolib.getDistance(
                {latitude: _lat, longitude: _lng},
                {latitude: IndexCtrl.rangeLat, longitude: IndexCtrl.rangeLng}
            );

            // アイコン設定
            _myIcon = IndexCtrl.mapIcon.my;

            if (IndexCtrl.myMarker != null) {
                IndexCtrl.mymap.removeLayer(IndexCtrl.myMarker);
            }
            IndexCtrl.myMarker = L.marker([_lat, _lng], {icon: _myIcon}).addTo(IndexCtrl.mymap);

            // 自分の表示位置を中心に
            if (IndexCtrl.autoF) {
                IndexCtrl.autoMove(_lat, _lng);
            }
            
            // ネコの当たり判定
            IndexCtrl.judgment();

            // 表示マーカーの制御
            if ((IndexCtrl.RANGE_DISTANCE /2) < _rangeDistance) {
                IndexCtrl.rangeLat = _lat;
                IndexCtrl.rangeLng = _lng;
                IndexCtrl.dispMarker(_lat, _lng);
                IndexCtrl.dispComment(_lat, _lng);
            }

            // データ再取得の制御
            if (IndexCtrl.CHANGE_DISTANCE < _changeDistance) {

                $.ajax({	
                    url:IndexCtrl.urls.getNostalgy, // 通信先のURL
                    type:'GET',		// 使用するHTTPメソッド
                    data:{
                        lat: _lat,
                        lng: _lng
                    }, // 送信するデータ
                    }).done(function(ret,textStatus,jqXHR) {
                        logger.info(ret); //コンソールにJSONが表示される
                        IndexCtrl.changeLat = _lat;
                        IndexCtrl.changeLng = _lng;
                        IndexCtrl.nostalgy = ret.results;
                        IndexCtrl.dispMarker(_lat, _lng);
                    }).fail(function(jqXHR, textStatus, errorThrown ) {
                        logger.error(errorThrown);
                    // }).always(function(){
                    //     logger.info('***** 処理終了 *****');
                    });
            } 
            // 処理終了
        }
        catch (ex) {
            logger.error(ex);
        }
        finally {
            Util.endWriteLog(IndexCtrl._className,_functionName);
        }
    },

    error: function UN_error(err) {
        var _functionName = 'UN_error';

        try {
            Util.startWriteLog(IndexCtrl._className,_functionName);
            // 処理開始
            logger.error(err);
            // 処理終了
        }
        catch (ex) {
            logger.error(ex);
        }
        finally {
            Util.endWriteLog(IndexCtrl._className,_functionName);
        }
    },

    dispMarker: function UN_dispMarker(lat, lng) {
        var _functionName = 'UN_dispMarker',
            _distance = 0,
            _pointLat = 0,
            _pointLng = 0,
            _point = [];

        try {
            Util.startWriteLog(IndexCtrl._className,_functionName);
            // 処理開始
            if (IndexCtrl.nostalgy) {
                if (IndexCtrl.markers) {
                    for (var i = 0; i < IndexCtrl.markers.length; i++) {
                        IndexCtrl.mymap.removeLayer(IndexCtrl.markers[i]);
                    }
                }

                IndexCtrl.markers = [];

                for (var i = 0; i < IndexCtrl.nostalgy.length; i++) {
                    var data = IndexCtrl.nostalgy[i];
                    _distance = geolib.getDistance(
                        {latitude: lat, longitude: lng},
                        {latitude: data.lat, longitude: data.lng}
                    );
                    if (IndexCtrl.RANGE_DISTANCE > _distance) {

                        if (IndexCtrl.appearance(data)) {
                            _pointLat = doRad(data.lat);
                            _pointLng = doRad(data.lng);
                            var alpha12 = Math.floor(Math.random() * 359);
                            var length = Math.floor(Math.random() * 500);
                            _point = vincenty(_pointLat, _pointLng, doRad(alpha12), length);
    
                            var marker = L.marker([_point[0], _point[1]], {icon: IndexCtrl.rarity(data)}).addTo(IndexCtrl.mymap);
                            marker.data = data;
                            IndexCtrl.markers.push(marker);
                        }
                    }
                }
            }
            // 処理終了
        }
        catch (ex) {
            logger.error(ex);
        }
        finally {
            Util.endWriteLog(IndexCtrl._className,_functionName);
        }
    },

    dispComment: function UN_dispComment(lat, lng) {
        var _functionName = 'UN_dispComment',
            _distance = 0,
            _pointLat = 0,
            _pointLng = 0,
            _point = [];

        try {
            Util.startWriteLog(IndexCtrl._className,_functionName);
            // 処理開始
            if (IndexCtrl.comments) {
                for (var i = 0; i < IndexCtrl.comments.length; i++) {
                    IndexCtrl.mymap.removeLayer(IndexCtrl.comments[i]);
                }
            }

            IndexCtrl.comments = [];

            $.ajax({	
                url:IndexCtrl.urls.getComment, // 通信先のURL
                type:'GET',		// 使用するHTTPメソッド
                data:{
                    userId: null,
                    lat: lat,
                    lng: lng,
                    distance: IndexCtrl.RANGE_DISTANCE /2
                }, // 送信するデータ
                }).done(function(ret,textStatus,jqXHR) {
                    for (var i = 0; i < ret.results.length; i++) {
                        var data = ret.results[i];
                        logger.info(data);
                        _pointLat = doRad(data.location[1]);
                        _pointLng = doRad(data.location[0]);
                        var alpha12 = Math.floor(Math.random() * 359);
                        var length = Math.floor(Math.random() * 50);
                        _point = vincenty(_pointLat, _pointLng, doRad(alpha12), length);

                        var marker = L.marker([_point[0], _point[1]], {icon: IndexCtrl.mapIcon.comment}).addTo(IndexCtrl.mymap)
                        .on('click', function(e) { 
                            // clickイベントの処理 
                            var data = e.target.data;
                            $('#commentView').show();
                            if (data.userId == IndexCtrl.userId) {
                                $('#doCommentEntry').show();
                                $('#doCommentDelete').show();
                                $('#doCommentOk').hide();
                                $('#doCommentCancel').show();
                                $('#commentField').prop('readOnly', false);
                            } else {
                                $('#doCommentEntry').hide();
                                $('#doCommentDelete').hide();
                                $('#doCommentOk').show();
                                $('#doCommentCancel').hide();
                                $('#commentField').prop('readOnly', true);
                            }
                            $('#commentField').removeClass('is-error');
                            $('#commentField').val(data.comment);
                            $('#commentLat').val(data.location[1]);
                            $('#commentLng').val(data.location[0]);
                            $('#commentId').val(data.uuid);
                        });
                        marker.data = data;
                        IndexCtrl.comments.push(marker);
                    }
                }).fail(function(jqXHR, textStatus, errorThrown ) {
                    logger.error(errorThrown);
                // }).always(function(){
                //     logger.info('***** 処理終了 *****');
                });
            // 処理終了
        }
        catch (ex) {
            logger.error(ex);
        }
        finally {
            Util.endWriteLog(IndexCtrl._className,_functionName);
        }
    },

    dispSize: function UN_dispSize() {
        var _functionName = 'UN_dispSize',
            // _navbarHeight,
            _windowHeight;

        try {
            Util.startWriteLog(IndexCtrl._className,_functionName);
            // 処理開始
            // _navbarHeight = $('.navbar').height();
            _windowHeight = $(window).height();
            $('body').height(_windowHeight);
            // 処理終了
        }
        catch (ex) {
            logger.error(ex);
        }
        finally {
            Util.endWriteLog(IndexCtrl._className,_functionName);
        }
    },
    

    autoMove: function UN_appearance(lat, lng) {
        var _functionName = 'UN_appearance',
            _distance = 0,
            _distanceAry = [],
            _min = 0,
            _lat = 0,
            _lng = 0,
            _up = [],
            _right = [],
            _down = [],
            _left = [],
            _bounds = {};

        try {
            Util.startWriteLog(IndexCtrl._className,_functionName);
            // 処理開始
            if (IndexCtrl.nostalgy == null) {
                return;
            }

            for (var i = 0; i < IndexCtrl.nostalgy.length; i++) {
                var data = IndexCtrl.nostalgy[i];
                _distance = geolib.getDistance(
                    {latitude: lat, longitude: lng},
                    {latitude: data.lat, longitude: data.lng}
                );
                _distanceAry.push(_distance);
            }
            _min = Math.min.apply(null, _distanceAry);
            _lat = doRad(lat);
            _lng = doRad(lng);
            _up = vincenty(_lat, _lng, doRad(0), _min);
            _right = vincenty(_lat, _lng, doRad(90), _min);
            _down = vincenty(_lat, _lng, doRad(180), _min);
            _left = vincenty(_lat, _lng, doRad(270), _min);
            _bounds = geolib.getBounds([
                { latitude: _up[0], longitude: _up[1] },
                { latitude: _right[0], longitude: _right[1] },
                { latitude: _down[0], longitude: _down[1] },
                { latitude: _left[0], longitude: _left[1] },
            ]);

            logger.info(_bounds.minLat+','+_bounds.maxLng);
            logger.info(_bounds.maxLat+','+_bounds.minLng);
            IndexCtrl.mymap.setView([ lat, lng]); //地図を移動
            IndexCtrl.mymap.fitBounds([
               [_bounds.minLat, _bounds.maxLng],
               [_bounds.maxLat, _bounds.minLng]
            ]);
            // 処理終了
        }
        catch (ex) {
            logger.error(ex);
        }
        finally {
            Util.endWriteLog(IndexCtrl._className,_functionName);
        }
    },

    appearance: function UN_appearance(data) {
        var _functionName = 'UN_appearance',
            _num = 0;

        try {
            Util.startWriteLog(IndexCtrl._className,_functionName);
            // 処理開始
            _num = Math.floor(Math.random() * 60);
            if (data.alleyRatio > _num) {
                return true;
            } else {
                return false;
            }
            // 処理終了
        }
        catch (ex) {
            logger.error(ex);
        }
        finally {
            Util.endWriteLog(IndexCtrl._className,_functionName);
        }
    },
    
    rarity: function UN_rarity(data) {
        var _functionName = 'UN_rarity';

        try {
            Util.startWriteLog(IndexCtrl._className,_functionName);
            // 処理開始
            if (15 >= data.nostalgiaRatio) {
                return IndexCtrl.mapIcon.gold;
            } else if (30 >= data.nostalgiaRatio) {
                return IndexCtrl.mapIcon.silver;
            } else {
                return IndexCtrl.mapIcon.bronze;
            }
            // 処理終了
        }
        catch (ex) {
            logger.error(ex);
        }
        finally {
            Util.endWriteLog(IndexCtrl._className,_functionName);
        }
    },

    auto: function UN_auto() {
        var _functionName = 'UN_auto';

        try {
            Util.startWriteLog(IndexCtrl._className,_functionName);
            // 処理開始
            IndexCtrl.autoF
            if (IndexCtrl.autoF) {
                $('#doAuto').html('手動');
                IndexCtrl.autoF = false;
            } else {
                $('#doAuto').html('自動');
                IndexCtrl.autoF = true;
            }
            // 処理終了
        }
        catch (ex) {
            logger.error(ex);
        }
        finally {
            Util.endWriteLog(IndexCtrl._className,_functionName);
        }
    },

    setComment: function UN_setComment(uuid, lat, lng, comment) {
        var _functionName = 'UN_setComment';

        try {
            Util.startWriteLog(IndexCtrl._className,_functionName);
            // 処理開始
            $.ajax({	
                url:IndexCtrl.urls.setComment, // 通信先のURL
                type:'POST',		// 使用するHTTPメソッド
                data:{
                    uuid: uuid,
                    userId: IndexCtrl.userId,
                    lat: lat,
                    lng: lng,
                    comment: comment
                }, // 送信するデータ
                }).done(function(ret,textStatus,jqXHR) {
                    logger.info(ret); //コンソールにJSONが表示される
                    IndexCtrl.dispComment(IndexCtrl.rangeLat, IndexCtrl.rangeLng);
                }).fail(function(jqXHR, textStatus, errorThrown ) {
                    logger.error(errorThrown);
                }).always(function(){
                    $('#commentView').hide();
                });
            // 処理終了
        }
        catch (ex) {
            logger.error(ex);
        }
        finally {
            Util.endWriteLog(IndexCtrl._className,_functionName);
        }
    },

    removeComment: function UN_removeCommentt(uuid) {
        var _functionName = 'UN_removeCommentt';

        try {
            Util.startWriteLog(IndexCtrl._className,_functionName);
            // 処理開始
            if(window.confirm('本当に削除しますか？')){
                $.ajax({	
                    url:IndexCtrl.urls.removeComment, // 通信先のURL
                    type:'POST',		// 使用するHTTPメソッド
                    data:{
                        uuid: uuid,
                        userId: IndexCtrl.userId
                    }, // 送信するデータ
                    }).done(function(ret,textStatus,jqXHR) {
                        logger.info(ret); //コンソールにJSONが表示される
                        IndexCtrl.dispComment(IndexCtrl.rangeLat, IndexCtrl.rangeLng);
                    }).fail(function(jqXHR, textStatus, errorThrown ) {
                        logger.error(errorThrown);
                    }).always(function(){
                        $('#commentView').hide();
                    });
            } else {
                // window.alert('キャンセルされました。');
            }
            // 処理終了
        }
        catch (ex) {
            logger.error(ex);
        }
        finally {
            Util.endWriteLog(IndexCtrl._className,_functionName);
        }
    },

    judgment: function UN_judgment() {
        var _functionName = 'UN_judgment',
            _markers = null,
            _data = null,
            _distance = 0;

        try {
            Util.startWriteLog(IndexCtrl._className,_functionName);
            // 処理開始
            if (IndexCtrl.markers) {
                for (var i = 0; i < IndexCtrl.markers.length; i++) {
                    _markers = IndexCtrl.markers[i];
                    _data = _markers.data;
                    _distancee = geolib.getDistance(
                        {latitude: IndexCtrl.lat, longitude: IndexCtrl.lng},
                        {latitude: _data.lat, longitude: _data.lng}
                    );
                    // 指定の範囲内に現れたら戦闘画面を表示
                    if (IndexCtrl.GET_DISTANCE > _distancee) {
                        AttackCtrl.attack(_data)
                        break;
                    } else {
                        logger.info(_data);
                    }
                }
            }
            // 処理終了
        }
        catch (ex) {
            logger.error(ex);
        }
        finally {
            Util.endWriteLog(IndexCtrl._className,_functionName);
        }
    },
};

$(document).ready(function(){
    IndexCtrl.init();
});
    
