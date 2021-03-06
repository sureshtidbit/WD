import React, { Component } from "react";
import {
    View,
    Platform,
    TouchableOpacity,
    Animated,
    AsyncStorage
} from "react-native";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { AudioRecorder, AudioUtils } from 'react-native-audio';
import axios from 'axios'
var APIURL = 'http://96.126.111.250:3090/'

/*
Handle google speech to text translation activities here
*/
class VoiceRecord extends Component {
    constructor() {
        super();
        this.animatedValue = new Animated.Value(70)
        this.animatedValue5 = new Animated.Value(1);
        this.state = {
            SpeakIconColor: 'red',
            SpeakBackColor: '#FFF',
            currentTime: 0.0,
            recording: false,
            paused: false,
            stoppedRecording: false,
            finished: false,
            audioPath: AudioUtils.CachesDirectoryPath,
            hasPermission: undefined,
            loader: false,
            increaseWidth: 25,
            Width: new Animated.Value(70),
            AudioFileName: '',
            SelectedLanguage: 'en-US'
        }
    }
    prepareRecordingPath(audioPath) {
        AudioRecorder.prepareRecordingAtPath(audioPath, {
            SampleRate: 22050,
            Channels: 1,
            AudioQuality: "High",
            AudioEncoding: "aac",
            AudioEncodingBitRate: 32000,
            IncludeBase64: true
        });
    }

    callToast() {
        Animated.timing(
            this.animatedValue,
            {
                toValue: 0,
                duration: 200
            }).start()
    }

    CheckLanguageCode() {
        AsyncStorage.getItem('WDLanguageCode').then((value) => {
            if (value !== undefined && value !== null) {
                this.setState({ SelectedLanguage: value })
            }
        })
    }

    componentDidMount() {
        this.CheckLanguageCode()
        this.animatedValue5 = new Animated.Value(1);
        this.callToast()
        AsyncStorage.getItem('SurveyPatientInfo').then((info) => {
            if (info != undefined || info != null) {
                var Info = JSON.parse(info)
                let fileName = 'test' + Info.id
                this.setState({ AudioFileName: fileName })
                AudioRecorder.requestAuthorization().then((isAuthorised) => {
                    this.setState({ hasPermission: isAuthorised });
                    if (!isAuthorised) return;
                    this.prepareRecordingPath(this.state.audioPath + '/' + fileName + '.aac');
                    AudioRecorder.onProgress = (data) => {
                        this.setState({ currentTime: Math.floor(data.currentTime) });
                    };
                    AudioRecorder.onFinished = (data) => {
                        if (Platform.OS === 'ios') {
                            this._finishRecording(data.status === "OK", data.audioFileURL, data.audioFileSize);
                        }
                    };
                });
            }
        })
    }

    GetSpeechText = async () => {
        let app = this
        let localAPI = 'http://127.0.0.1:3090/'
        axios.get(APIURL + 'speech' + '/' + app.state.AudioFileName + '?LanguageCode=' + app.state.SelectedLanguage).then(function (response) {
            console.warn('json==>>> output', response)
            app.props.onLoad(false)
            if (response.data.success) {
                if (response.data.data != undefined) {
                    app.props.translationData(response.data.data)
                } else {
                    app.props.ErrorAlert('No transalated text found, try again!')
                }
                app.setState({ loader: false })
            } else {
                app.props.ErrorAlert(response.data.message)
            }
        }).catch(function (err) {
            app.props.onLoad(false)
            app.setState({ loader: false })
            app.props.ErrorAlert('Oops, Internal server error, Try again later')
        })
    }

    uploadAudio = async () => {
        let app = this
        app.setState({ loader: true })
        const path = `file://${AudioUtils.CachesDirectoryPath}/${this.state.AudioFileName}.aac`
        const formData = new FormData()
        formData.append('file', {
            uri: path,
            name: this.state.AudioFileName,
            type: 'audio/aac',
        })
        let localAPI = 'http://127.0.0.1:3090/'
        const config = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
                "cache-control": "no-cache",
                "processData": false,
                "contentType": false,
                "mimeType": "multipart/form-data",
            }
        };
        axios.post(APIURL + 'upload' + '/' + app.state.AudioFileName, formData, config)
            .then(response => {
                console.log('response', response)
                if (response.data.success) {
                    app.GetSpeechText()
                } else {
                    app.props.onLoad(false)
                    app.props.ErrorAlert(response.data.message)
                }
            })
            .catch(errors => {
                app.props.onLoad(false)
                app.setState({ loader: false })
                app.props.ErrorAlert('Oops, Internal server error, Try again later')
            });
    }

    async _onPressOut() {
        let app = this
        Animated.spring(this.animatedValue5, {
            toValue: 1,
            friction: 3,
            tension: 40
        }).start()
        app.setState({ SpeakBackColor: '#FFF', SpeakIconColor: 'red', increaseWidth: 25 })
        if (!this.state.recording) {
            return;
        }
        app.props.ListeningMethod(false)
        this.setState({ stoppedRecording: true, recording: false, paused: false });
        try {
            const filePath = await AudioRecorder.stopRecording();
            app.props.onLoad(true)
            app.uploadAudio()
            return filePath;
        } catch (error) {
            app.props.ListeningMethod(false)
        }
    }

    AnimateButton() {
        Animated.spring(this.animatedValue5, {
            toValue: 1.5
        }).start()
    }

    async _onLongPress() {
        let app = this
        app.setState({ SpeakBackColor: 'red', SpeakIconColor: '#FFF', increaseWidth: 45 }, () => {
            app.AnimateButton()
        })
        app.props.ListeningMethod(true)
        if (this.state.recording) {
            return;
        }
        if (!this.state.hasPermission) {
            return;
        }
        if (this.state.stoppedRecording) {
            this.prepareRecordingPath(this.state.audioPath + '/' + this.state.AudioFileName + '.aac');
        }
        this.setState({ recording: true, paused: false });
        try {
            const filePath = await AudioRecorder.startRecording();
        } catch (error) {
        }
    }

    _finishRecording(didSucceed, filePath, fileSize) {
        this.setState({ finished: didSucceed });
    }

    render() {
        const animatedStyle = {
            transform: [{ scale: this.animatedValue5 }]
        }
        return (
            <Animated.View style={[{
                zIndex: 1000, backgroundColor: "#1E887B", borderRadius: 100,
                height: 70,
                width: 70,
                marginBottom: this.state.increaseWidth, borderColor: '#EEEEEE', justifyContent: 'center', alignItems: 'center'
            }, animatedStyle]}
            >
                <TouchableOpacity
                    style={{
                        height: 70,
                        width: 70,
                        justifyContent: 'center', alignItems: 'center'
                    }}
                    onLongPress={() => this._onLongPress()}
                    onPressOut={() => this._onPressOut()}>
                    <FontAwesome size={24} name="microphone" color={'#FFF'} />
                </TouchableOpacity>

            </Animated.View>
        );
    }
}
export default VoiceRecord;