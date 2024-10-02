


export default {
    namespaced: true,
    state: {

        //
        sessions: [],

        session : {
            id: '',
            trials: []
        },
        calibrated: false,

        trial : {
            id: '',
            trialName: '',
            isProcessing: true
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
            "transgender": "Transgender",
            "non-binary": "Non-Binary/Non-Conforming",
            "prefer-not-respond": "Prefer not to respond",
          },
        
        test_session: false,

        visualizerJSON: null


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
        SET_SUBJECTS(state, subjects){
            state.subjects = subjects
        },
        SET_CALIBRATED(state, calibrated){
            state.calibrated = calibrated
        },
        SET_TEST_SESSION(state, value){
            state.test_session = value
        },
        SET_VISUALIZER_JSON(state, value){
            state.visualizerJSON = value
        }
    }
}