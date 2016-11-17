/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2015 Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

var _ = require('lodash');
var bows = require('bows');
var cx = require('classnames');
var React = require('react');

var debug = bows('Section');

var basicsActions = require('../logic/actions');
var NoDataContainer = require('./NoDataContainer');

var DashboardSection = React.createClass({
  propTypes: {
    bgClasses: React.PropTypes.object.isRequired,
    bgUnits: React.PropTypes.string.isRequired,
    data: React.PropTypes.object.isRequired,
    days: React.PropTypes.array.isRequired,
    name: React.PropTypes.string.isRequired,
    onSelectDay: React.PropTypes.func.isRequired,
    open: React.PropTypes.oneOf([true, false, 'na']).isRequired,
    section: React.PropTypes.object.isRequired,
    timezone: React.PropTypes.string.isRequired,
    title: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.func ]).isRequired,
    trackMetric: React.PropTypes.func.isRequired,
  },
  render: function() {
    var dataDisplay;
    var section = this.props.section;
    if (section.column === 'right') {
      if (section.active) {
        dataDisplay = (
          <section.container
            bgClasses={this.props.bgClasses}
            bgUnits={this.props.bgUnits}
            chart={section.chart}
            data={this.props.data}
            days={this.props.days}
            hasHover={section.hasHover}
            hoverDisplay={section.hoverDisplay}
            onSelectDay={this.props.onSelectDay}
            sectionId={section.id}
            selector={section.selector}
            selectorOptions={section.selectorOptions}
            timezone={this.props.timezone}
            type={section.type} />
        );
      }
      else {
        dataDisplay = (
          <NoDataContainer moreInfo={section.noDataMessage || null} />
        );
      }
    }
    else {
      dataDisplay = (
        <section.container
          bgClasses={this.props.bgClasses}
          bgUnits={this.props.bgUnits}
          chart={section.chart}
          data={this.props.data}
          days={this.props.days}
          title={this.props.title} />
      );
    }
    var iconClass = null;
    if (this.props.open !== 'na') {
      iconClass = cx({
        'icon-down': this.props.open,
        'icon-right': !this.props.open
      });
    }
    var containerClass = cx({
      'DashboardSection-container': true
    });

    var titleContainer;
    if (this.props.title && typeof this.props.title === 'function') {
      titleContainer = this.props.title({
        data: this.props.data,
        iconClass: iconClass,
        sectionName: this.props.name,
        trackMetric: this.props.trackMetric
      });
    } else {
      var headerClasses = cx({
        'SectionHeader--nodata': section.noData,
        'selectable': this.props.open !== 'na'
      });
      titleContainer = (
        <h3 className={headerClasses} onClick={this.handleToggleSection}>{this.props.title}
          <i className={iconClass}/>
        </h3>
      );
    }

    return (
      <div className='DashboardSection'>
        {titleContainer}
        <div className={containerClass} ref='container'>
          <div className='DashboardSection-content' ref='content'>
            {this.props.open ? dataDisplay : null}
          </div>
        </div>
      </div>
    );
  },
  handleToggleSection: function(e) {
    if (e) {
      e.preventDefault();
    }
    if (this.props.open !== 'na') {
      basicsActions.toggleSection(this.props.name, this.props.trackMetric);
    }
  }
});

module.exports = DashboardSection;
