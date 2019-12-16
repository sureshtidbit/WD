import RNFetchBlob from 'react-native-fetch-blob'
const development = 'https://stage-manager.worddiagnostics.com/api/'
const production = 'https://manager.worddiagnostics.com/api/'
let mode = 'production'
export const API = mode == 'production' ? production : development
export const BankIDAPI = 'http://96.126.111.250:3091/'

/*
POST API with token
*/
export const PostAPI = (url, body, token) => {
    return RNFetchBlob.config({
        trusty: true
    }).fetch('POST', API + url, {
        'Authorization': 'Bearer ' + token,
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
    }, body)
        .then((response) => response.json())
        .then((responseData) => {
            return responseData
        }).catch(function (error) {
            return error
        })
}


/*
POST API without token
*/
export const Post = (url, body) => {
    return RNFetchBlob.config({
        trusty: true
    }).fetch('POST', API + url, {
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
    }, body)
        .then((response) => response.json())
        .then((responseData) => {
            console.log(responseData,'11==>>')
            return responseData
        }).catch(function (error) {
            console.log(error,'22==>>')
            return error
        })
}


/*
POST API
*/
export const GetAPI = (url, token) => {
    return RNFetchBlob.config({
        trusty: true
    }).fetch('GET', API + url, {
        'Authorization': 'Bearer ' + token,
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
    })
        .then((response) => response.json())
        .then((responseData) => {
            return responseData
        }).catch(function (error) {
            return error
        })
}