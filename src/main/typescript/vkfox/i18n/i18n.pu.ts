"use strict";
// Set correct language for "moment" library
import I18N from './i18n';
import * as moment from "moment";

moment.locale(I18N.getLang());

export default I18N;
