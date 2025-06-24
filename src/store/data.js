
export default {
    namespaced: true,
    state: {
        rows: 4,
        cols: 5,
        squareSize: 35,
        //
        sessions: [],

        session : {
            id: '',
            trials: [],
            maxCams: 0,
        },
        calibrated: false,
        neutralPose: false, // whetever the neutral pose is recorded.

        trial : {
            uuid: '',
            trialName: '',
            processed: ''
        },
        // For neutral session recording:
        // step 4
        identifier: '',
        weight: 70,
        height: 1.80,
        sex: 'woman',
        gender: 'woman',
        data_sharing: '',
        scaling_setup: 'upright_standing_pose',
        pose_model: 'hrnet',
        framerate: 60,
        openSimModel: 'LaiUhlrich2022',
        augmenter_model: 'v0.3',
        filter_frequency: 'default',

        // For dynamic recordings:
        trialName: '',
        newTrialId: '',

        // For subjects
        subjects: [],
        subjectTags: {

        },
        sexes: {
            // "": "",
            "woman": "Woman",
            "man": "Man",
            "intersect": "Intersex",
            "not-listed": "Not Listed",
            "prefer-not-respond": "Prefer not to respond"
          },
          genders: {
            // "": "",
            "woman": "Woman",
            "man": "Man",
            "non-binary": "Non-Binary/Non-Conforming",
            "prefer-not-respond": "Prefer not to respond",
          },
        
        test_session: false,

        visualizerJSON: null,
        visualizerVideos: [],

        

    },
    actions: {
        // Put /data/store actions here        

    },
    mutations: {
        setNeutral (state, { subject, data_sharing, scaling_setup, pose_model, openSimModel, augmenter_model, filter_frequency }) {
            // state.identifier = identifier
            // state.weight = weight
            // state.height = height
            // state.sex = sex
            // state.gender = gender
            state.subject = subject
            state.data_sharing = data_sharing
            state.scaling_setup = scaling_setup
            state.pose_model = pose_model
            state.openSimModel = openSimModel
            state.augmenter_model = augmenter_model
            state.filter_frequency = filter_frequency
          },
        SET_ROWS(state, rows){
            state.rows = rows
        },
        SET_COLS(state, cols) {
            state.cols = cols
        },
        SET_SQUARESIZE(state, squareSize){
            state.squareSize = squareSize
        },
        SET_SUBJECTS(state, subjects){
            state.subjects = subjects
        },
        SET_CALIBRATED(state, calibrated){
            state.calibrated = calibrated
        },
        SET_NEUTRALPOSE(state, value){
            state.neutralPose = value
        },
        SET_TEST_SESSION(state, value){
            state.test_session = value
        },
        SET_VISUALIZER_JSON(state, value){
            state.visualizerJSON = value
        },
        SET_SESSION_TRIALS(state, trialDict) {
        console.log("SETTING NEW SESSIONS: ", trialDict)
        // Transform the received JSON into the desired format
        const trials = Object.entries(trialDict).map(([key, value]) => ({
            uuid: value.uuid || '',
            trialName: value.trialName || key,
            processed: value.processed || false,
          }));
          // commit it to state
            state.session.trials = trials
        },
        SET_SESSION_MAXVIDCOUNT(state, count){
            console.log("session max vid count is: ", count)
            state.session.maxCams = count
        },

        SET_NEW_TRIAL_ID(state, newTrialId){
            console.log("setting newTrialID")
            state.newTrialId = newTrialId
        },
        SET_VISUALIZER_VIDEOS(state, videos){
            state.visualizerVideos = videos
        }

    }
}