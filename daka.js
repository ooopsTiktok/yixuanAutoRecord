// 目的 通过nightmare 实现页面基本功能，访问打卡功能

// # 补充-测试过程发现计时器爆内存，开始使用node-schedule计时器，先测测看吧
var schedule = require('node-schedule');

// 第一步 引入插件
var Nightmare = require('nightmare');

// nightmare方法

// ------ 自定义方法,放在nightmare实例化之前 -------

//自定义处理节点 - 处理iframe里面节点
Nightmare.action('iframeExtract', function(selector, done) {
    //`this` is the Nightmare instance
    this.evaluate_now((selector) => {

        // - 这里是获取iframe下面的节点
        var tar;
        try {
            //执行点击
            document
                .querySelector(selector)
                .contentDocument
                .documentElement
                .querySelectorAll('a')[1]
                .click()
        } catch (err) {
            try {
                document.querySelectorAll('a')[1].click()
            } catch (err) {
                console.log(err)
            }
        }

        // - 返回节点消息
        return new Date().toLocaleString() + '- 进入打开！'
    }, done, selector)
});


//自定义处理节点 - 处理iframe里面节点
Nightmare.action('btnExtract', function(selector, done) {
    //`this` is the Nightmare instance
    this.evaluate_now((selector) => {

        // - 这里是获取iframe下面的节点
        var tar;
        try {
            //执行点击
            document.querySelector(selector)
                .contentDocument
                .documentElement
                .querySelector('input[type=submit]')
                .click()
        } catch (err) {
            try {
                document.querySelector('input[type=submit]').click()
            } catch (err) {
                console.log(err)
            }
        }

        // - 返回节点消息
        return new Date().toLocaleString() + '- 打卡成功！' + document
            .querySelector(selector)
            .contentDocument
            .documentElement
            .querySelector('input[type=submit]').value
    }, done, selector)
});

// 参考文档 - https://www.dazhuanlan.com/2019/09/29/5d909c92ddc64/?__cf_chl_jschl_tk__=368bea93784d27ec821e601ff8285f3d05a2de20-1589964731-0-AbZK9t1y-jr49BsSzS_-EHRcudH-OU0EnPgfu_gWJVdBQ0_jeXk-RaOgbwmExN1ixAyoNvzrRFQgbl3GG7dAg9qtuCf7caFRcZuSi5x9NjfQuUgtdkojVD2VvsE1Z_occi4UTZC5e5holti5opsT_KGR34Wniy_z92hTo2Lu7uMZ0FXh9DIw4osjJE8Rx-2SBy4aul7smRR5kHJ8iSr_xfutmtG0lqI1PfAQkb-SAs_dQDdijjuGoht9hum13AspXKSYbFuYQI1Y1TarHOHly_AdapPdgkHXt3CVqDphF8OCa3nTESc9qoOW1aRO9EV4KQ
function visiteyixuan(acount, psw, uagent) {
    let user = acount || '';
    let password = psw || '';
    let getAgent = uagent || "";
    let targetURL = 'http://xxx.xxxx.xxx';
    // 第二步 实例化nightmare
    var nightmare = Nightmare({
        show: true, //显示electron窗口
    });

    // 第三步 开始写逻辑 - 单个流程
    nightmare
        .useragent(getAgent)
        //登录
        .goto(targetURL)
        //输入 - 账号
        .wait('input[name=email]')
        .insert('input[name=email]', user)
        //输入 - 密码
        .wait('input[name=password]')
        .insert('input[name=password]', password)
        // 点击 - 登录
        .wait('input[name=login]')
        .click('input[name=login]')

        //查找节点 方法2 会遇到网络延迟，所以等延迟
        .wait(3000, '#leftFrame')
        .iframeExtract('#leftFrame')
        //查找节点 方法2 会遇到网络延迟，所以等延迟
        .wait(3000, '#rightFrame')
        .btnExtract('#rightFrame')
        .end()
        .then((text) => {
            console.log(text)
            // return nightmare.refresh();
            // return nightmare.end();
        });
}

// 第四步 开始写计时器
/**
 *  逻辑说明
 *  1、默认排除指定节假日、周六、周末，其他时间为打卡时间段
 *  2、指定时间段前一小时触发，例如：9点打卡、那8点就开始执行分循环
 *  3、模拟指定分钟的范围区间，运用随机分钟来打卡；例如：30～60之间的随机数，当前分大于随机数开始执行秒循环
 *  4、随机指定秒，当前秒等于随机指定秒时，触发打卡、Nightmare
 */
var clatime = {
    exclude: [
        //元旦
        '2021/1/1',
        '2021/1/2',
        '2021/1/3',
        //春节
        '2021/2/11',
        '2021/2/12',
        '2021/2/13',
        '2021/2/14',
        '2021/2/15',
        '2021/2/16',
        '2021/2/17',
        //清明
        '2021/4/3',
        '2021/4/4',
        '2021/4/5',
        //劳动
        '2021/5/1',
        '2021/5/2',
        '2021/5/3',
        '2021/5/4',
        '2021/5/5',
        //端午
        '2021/6/12',
        '2021/6/13',
        '2021/6/14',
        //中秋
        '2021/9/19',
        '2021/9/20',
        '2021/9/21',
        //国庆
        '2021/10/1',
        '2021/10/2',
        '2021/10/3',
        '2021/10/4',
        '2021/10/5',
        '2021/10/6',
        '2021/10/7'
    ], //存放当前放假日期列表
    acount: '', //账号
    password: '', //密码
    useragent: '', //浏览器版本
    isNeedHomeRun: true, //是否需要开启下班打卡
    isRunNow: false, //是否先立刻执行、还是延迟打卡 默认：延迟打卡
    workTime: '8:35', //上班打卡时间
    homeTime: '18:30', //下班打卡时间
    scheduleMin: 24, //延迟随机数；注意这里时间别设置大了，否则{ workTime + scheduleMin的随机数 > 你上班时间}那你就迟到咯
    home_delayMin: 30, //下班打卡随机时间 + 随机数分 弃用
    dealWorkTime: function() {
        // # 每分钟的第30秒触发： '30 * * * * *'
        // # 每小时的1分30秒触发 ：'30 1 * * * *'
        // # 每天的凌晨1点1分30秒触发 ：'30 1 1 * * *'
        // # 每月的1日1点1分30秒触发 ：'30 1 1 1 * *'
        // # 2016年的1月1日1点1分30秒触发 ：'30 1 1 1 2016 *'
        // # 每周1的1点1分30秒触发 ：'30 1 1 * * 1'
        let { workTime, homeTime, isNeedHomeRun } = clatime;
        let worklist = workTime.split(/:/);
        let homelist = homeTime.split(/:/);

        //是否需要开启下班打卡
        if (isNeedHomeRun) {
            console.log(`设置 -> 上班打卡${workTime},下班打卡${homeTime}`);
            return `0 ${worklist[1]},${homelist[1]} ${worklist[0]},${homelist[0]} * * *`
        } else {
            console.log(`设置 -> 只上班打卡,时间为${workTime}`);
            return `0 ${worklist[1]} ${worklist[0]} * * *`
        }
    },
    anaysisWorkTime: function() {
        //判断是否在指定时间执行
        let { workTime, homeTime, isNeedHomeRun } = clatime;
        let worklist = workTime.split(/:/);
        let hours = new Date().getHours();
        let minu = new Date().getMinutes();
        if (isNeedHomeRun) {
            //会触发四次、只有两次正确

            let homelist = homeTime.split(/:/);
            //上午打卡触发时间
            if (parseInt(worklist[0], 10) === hours && parseInt(worklist[1], 10) === minu) {
                console.log('-> 上班打卡')
                return true;
            };

            //下午打卡触发时间
            if (parseInt(homelist[0], 10) === hours && parseInt(homelist[1], 10) === minu) {
                console.log('-> 下班打卡')
                return true;
            };

            return false;

        } else {
            //上午打卡触发时间
            if (parseInt(worklist[0], 10) === hours && parseInt(worklist[1], 10) === minu) {
                console.log('-> 上班打卡')
                return true;
            };

            return false;
        }
    },
    extractDay: function() {
        //判断今天是星期几,周六、周末为false
        var nowday = new Date().getDay();
        if (nowday === 0 || nowday === 6) {
            return false
        } else {
            return true
        }
    },
    excludeDay: function() {
        //法定节假日、周六、周末return false, 工作日return true
        let { exclude, extractDay } = this;
        let nowDate = new Date().toLocaleDateString().replace(/-/g, '/'); //格式 2020/12/23
        if (exclude.length > 0) {
            //进行法定节假日匹配
            if (exclude.filter((item) => {
                    // console.log(item, nowDate, item === nowDate)
                    if (item === nowDate) {
                        return item;
                    }
                }).length) {
                // -- 不执行 --
                console.log('### 法定节假日期间 ###');
                return false;
            } else {
                //进行周六日匹配
                if (extractDay()) {
                    // -- 执行 --
                    console.log('### 工作日打卡 ###')
                    return true;
                } else {
                    console.log('### 周末休假期间 ###')
                    return false;
                }
            }
        } else {
            //进行周六日匹配
            if (extractDay()) {
                // -- 执行 --
                console.log('### 工作日打卡 ###')
                return true;
            } else {
                console.log('### 周末休假期间 ###')
                return false;
            }
        }
    },
    scheduleDelayTimestamp: function() {
        let { scheduleMin, isRunNow } = this;
        //获取随机秒、随机分时间戳之和 == 计时器延时
        let s = parseInt(Math.random() * 60, 10) * 1000;
        let m = parseInt(Math.random() * scheduleMin, 10) * 60 * 1000;
        return isRunNow ? 0 : (s + m)
    },
    scheduleDelayHomeTimestamp: function() {
        //延迟下班打卡时间
        let { home_delayMin, isRunNow } = this;
        //获取随机秒、随机分时间戳之和 == 计时器延时
        let s = parseInt(Math.random() * 60, 10) * 1000;
        let m = parseInt(Math.random() * home_delayMin, 10) * 60 * 1000;
        return isRunNow ? 0 : (s + m)
    },
    scheduleLoop: function() {
        // - 这里使用node-schedule服务端计时器插件
        let { excludeDay, scheduleDelayTimestamp, workTime, acount, password, isNeedHomeRun, dealWorkTime, anaysisWorkTime } = this;
        let that = this;
        // 每天早上8:35:00开始定时发送任务
        // console.log(dealWorkTime())
        schedule.scheduleJob(dealWorkTime(), function() {
            let timestamp = scheduleDelayTimestamp.call(that);
            console.log('随机延迟数为', timestamp);
            //过滤节假日、若工作日返回true
            if (excludeDay.call(that)) {
                //过滤上、下班时间
                if (anaysisWorkTime()) {
                    setTimeout(() => {
                        console.log('执行打卡程序', new Date().toLocaleString());
                        visiteyixuan(acount, password);
                    }, timestamp);

                }
            }
        });

    },
    init: function() {
        console.log('启动上班打卡程序！！')
        this.scheduleLoop()
    }
}

clatime.init();
