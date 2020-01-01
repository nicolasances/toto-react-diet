import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import moment from 'moment';

export function color() {

  // var hour = moment().format('H');

  // if (hour < 7 || hour > 18) return themeNight;

  return themeDay;
  // return themeNight;

}

const themeDay = {
  COLOR_THEME : '#00acc1',
  COLOR_THEME_LIGHT : '#5ddef4',
  COLOR_THEME_DARK : '#007c91',
  COLOR_ACCENT : '#ffeb3b',
  COLOR_ACCENT_LIGHT : '#ffff72',
  COLOR_ACCENT_DARK : '#c8b900',
  COLOR_TEXT: 'rgba(0,0,0,0.7)',
  COLOR_TEXT_ACCENT: 'rgba(0,0,0,0.7)',
}

const themeNight = {
  COLOR_THEME : '#00838f',
  COLOR_THEME_LIGHT : '#4fb3bf',
  COLOR_THEME_DARK : '#005662',
  COLOR_ACCENT : '#fff176',
  COLOR_ACCENT_LIGHT : '#ffffa8',
  COLOR_ACCENT_DARK : '#cabf45',
  COLOR_TEXT: 'rgba(255,255,255,0.7)',
  COLOR_TEXT_ACCENT: 'rgba(0,0,0,0.7)',
}
