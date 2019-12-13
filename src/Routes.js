import React, { Component } from 'react';
import Login from './components/login/login';
import FormSurvey from './components/form-based-survey/index';
import { Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
	createStackNavigator,
	createBottomTabNavigator,
	createAppContainer,
	createSwitchNavigator
} from 'react-navigation';
import HomeScreen from './components/survey-action/survey-options/pages/HomeScreen';
import ProfileScreen from './components/survey-action/survey-options/pages/ProfileScreen';
import ChangePassword from './components/survey-action/survey-options/pages/ChangePassword';
import HomeIconWithBadge from './components/survey-action/survey-options/pages/HomeIcon';
import PendingSurveyList from './components/pendingSurveyList'
import CompletedSurveyList from './components/completedSurveyList'
import CompleteSurvey from './components/form-based-survey/form-cards/completeSurvey'
import Signup from './components/login/signup'
import LoginWithBankID from './components/login/loginWithBankID'
import ForgotPassword from './components/login/forgot_password'

const HomeStack = createStackNavigator(
	{
		Home: { screen: HomeScreen },

	},
	{
		headerMode: 'none',
		navigationOptions: {
			headerVisible: false,
		}
	}
);

const UserStack = createStackNavigator(
	{
		User: { screen: ProfileScreen },
		ChangePassword: { screen: ChangePassword },
		Profile: { screen: ProfileScreen },
	},
	{
		headerMode: 'none',
		navigationOptions: {
			headerVisible: false,
		}
	}
);
UserStack.navigationOptions = ({ navigation }) => {
	let tabBarVisible = true;
	if (navigation.state.routes.length > 1) {
		navigation.state.routes.map(route => {
			if (route.routeName === "ChangePassword") {
				tabBarVisible = false;
			} else {
				tabBarVisible = true;
			}
		});
	}
	return {
		tabBarVisible
	};
};
const AppTakeSurvey = createBottomTabNavigator(
	{
		Home: { screen: HomeStack },
		Profile: { screen: UserStack },
	},
	{
		defaultNavigationOptions: ({ navigation }) => ({
			tabBarIcon: ({ focused, horizontal, tintColor }) => {
				const { routeName } = navigation.state;
				let IconComponent = Ionicons;
				let iconName;
				if (routeName === 'Home') {
					if (Platform.OS === 'ios') {
						iconName = 'ios-home';
					} else {
						iconName = 'md-home';
					}

					return <IconComponent name={iconName} size={28} color={tintColor} />;
				} else if (routeName === 'Profile') {
					iconName = 'md-settings';
					return <Icon name="user" size={28} color={tintColor} />;
				} else if (routeName === 'Notification') {
					if (Platform.OS === 'ios') {
						iconName = 'ios-notifications';
					} else {
						iconName = 'md-notifications';
					}
					IconComponent = HomeIconWithBadge;
				}
				return <IconComponent name={iconName} size={28} color={tintColor} />;


			},
		}),
		tabBarOptions: {
			activeTintColor: '#43CC53',
			inactiveTintColor: '#455a64',
			style: {
				backgroundColor: '#FFF',
				shadowOffset: { width: 5, height: 3 },
				shadowColor: 'black',
				shadowOpacity: 0.5,
				elevation: 5,
				borderTopColor: '#f2f2f2',
				borderTopWidth: 1
			}
		},
	}
);
const AppLogin = createStackNavigator(
	{
		Home: { screen: Login }
	},
	{
		headerMode: 'none',
		navigationOptions: {
			headerVisible: false,
		}
	}
);
const AppSignUp = createStackNavigator(
	{
		Signup: { screen: Signup }
	},
	{
		headerMode: 'none',
		navigationOptions: {
			headerVisible: false,
		}
	}
);
const AppLoginWithBankID = createStackNavigator(
	{
		LoginWithBankID: { screen: LoginWithBankID }
	},
	{
		headerMode: 'none',
		navigationOptions: {
			headerVisible: false,
		}
	}
);
const AppForgotPassword = createStackNavigator(
	{
		ForgotPassword: { screen: ForgotPassword }
	},
	{
		headerMode: 'none',
		navigationOptions: {
			headerVisible: false,
		}
	}
);
const AppFormSurvey = createStackNavigator(
	{
		FormSurvey: { screen: FormSurvey },
	},
	{
		headerMode: 'none',
		navigationOptions: {
			headerVisible: false,
		}
	}
);
const AppCompletedSurveyList = createStackNavigator(
	{
		CompletedSurveyList: { screen: CompletedSurveyList },
	},
	{
		headerMode: 'none',
		navigationOptions: {
			headerVisible: false,
		}
	}
);
const AppPendingSurveyList = createStackNavigator(
	{
		PendingSurveyList: { screen: PendingSurveyList },
	},
	{
		headerMode: 'none',
		navigationOptions: {
			headerVisible: false,
		}
	}
);
const UserCompleteSurvey = createStackNavigator(
	{
		CompleteSurvey: { screen: CompleteSurvey },
	},
	{
		headerMode: 'none',
		navigationOptions: {
			headerVisible: false,
		}
	}
);
const Routes = createAppContainer(createSwitchNavigator(
	{
		TakeSurvey: AppTakeSurvey,
		Login: AppLogin,
		Signup: AppSignUp,
		LoginWithBankID: AppLoginWithBankID,
		ForgotPassword: AppForgotPassword,
		FormSurvey: AppFormSurvey,
		PendingSurveyList: AppPendingSurveyList,
		CompletedSurveyList: AppCompletedSurveyList,
		CompleteSurvey: UserCompleteSurvey
	},
	{
		initialRouteName: 'Login',
	}
));
export default Routes;