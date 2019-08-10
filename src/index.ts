const json = require("./idiom")
import Vue from 'vue';
// @ts-ignore
import VueClipboard from 'vue-clipboard2'

Vue.use(VueClipboard)

interface Data {
    abbreviation: string
    derivation: string
    example: string
    explanation: string
    pinyin: string
    word: string
    level?: number
}

let state = {firstPinyin: {}, lastPinyin: {}, word: {}};

interface State {
    firstPinyin: {
        [key: string]: Data[]
    }
    lastPinyin: {
        [key: string]: Data[]
    }
    word: {
        [key: string]: Data
    }
    error?: string
}

const getFirstPinyin = (pinyin: string) => {
    return pinyin.normalize('NFKD').replace(/[^\w\s]|\s.+/g, '')
}

const getLastPinyin = (pinyin: string) => {
    return pinyin.normalize('NFKD').replace(/[^\w\s]|.+\s/g, '')
}

const fix = (data: Data) => {
    if ('味同嚼蜡' === data.word) {
        data.pinyin = data.pinyin.replace('cù', 'là')
    }
    if (data.word.endsWith('俩')) {
        data.pinyin = data.pinyin.replace('liǎng', 'liǎ')
    }
    data.pinyin = data.pinyin.replace(/yi([ēéěèêe])/g, 'y$1')
    return data;
}

//TODO

let ret = ''


const app = new Vue({
    el: "#app",
    data: {
        pinyinIdiom: "",
        pinyinInput: "",
        seq: [],
        ret: ""
    },
    methods: {
        inputFun: function () {
            this.seq = handle(this.pinyinIdiom, state)
            this.ret = ret;
        },
        inputFun2: function () {
            this.seq = handle2(this.pinyinInput, state)
            this.ret = ret;
        },
        doCopy: function () {
            this.$copyText(this.ret).then(function (e: Event) {
                console.log(e)
            }, function (e: Event) {
                console.log(e)
            })
        }
    }
});
const indexed = (json: Data[]) => {
    const result: State = {firstPinyin: {}, lastPinyin: {}, word: {}}
    for (const data of json) {
        fix(data)
        if (data.word.length === 4) {
            const key1 = getLastPinyin(data.pinyin)
            const values1 = result.lastPinyin[key1] || []
            result.lastPinyin[key1] = values1
            values1.push(data)

            const key2 = getFirstPinyin(data.pinyin)
            const values2 = result.firstPinyin[key2] || []
            result.firstPinyin[key2] = values2
            values2.push(data)

            result.word[data.word] = data
        }
    }
    let pinyins = new Set(['yi'])
    for (let level = 1; pinyins.size > 0; ++level) {
        const newpinyins = new Set<string>()
        pinyins.forEach(pinyin => {
            for (const data of result.lastPinyin[pinyin] || []) {
                if (!data.level) {
                    data.level = level
                    newpinyins.add(getFirstPinyin(data.pinyin))
                }
            }
        })
        console.log(`Generate ${newpinyins.size} entries for level ${level}`)
        pinyins = newpinyins
    }
    return result
}

const handle = (input: string, state: State) => {
    const result: string[] = []
    ret = ""
    let data = state.word[input]
    while (data && data.level) {
        const level = data.level
        ret += `${data.word}`
        ret += " "
        result.push(`${data.word}（${data.pinyin}）`)
        if (level > 1) {
            const next = state.firstPinyin[getLastPinyin(data.pinyin)]
            const filtered = next.filter(d => d.level && d.level < level)
            data = filtered[Math.floor(Math.random() * filtered.length)]
        } else {
            result.push('一个顶俩（yī gè dǐng liǎ）')
            ret += "一个顶俩"
            return result
        }
    }
    return result
}

const handle2 = (input: string, state: State) => {
    const result: string[] = []
    ret = ""
    if (!input.match(/[\p{ASCII}]+/u)) {
        return result
    }
    const next = state.firstPinyin[input]
    if (next === undefined) return result
    const index = Math.floor(Math.random() * next.length)
    let data = next[index];
    while (data && data.level) {
        const level = data.level
        ret += `${data.word}`
        ret += " "
        result.push(`${data.word}（${data.pinyin}）`)
        if (level > 1) {
            const next = state.firstPinyin[getLastPinyin(data.pinyin)]
            const filtered = next.filter(d => d.level && d.level < level)
            data = filtered[Math.floor(Math.random() * filtered.length)]
        } else {
            result.push('一个顶俩（yī gè dǐng liǎ）')
            ret += "一个顶俩"
            return result
        }
    }
    return result
}

function init() {
    // index
    state = indexed(json)
}

init()
