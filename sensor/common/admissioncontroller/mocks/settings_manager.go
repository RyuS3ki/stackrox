// Code generated by MockGen. DO NOT EDIT.
// Source: settings_manager.go

// Package mocks is a generated GoMock package.
package mocks

import (
	reflect "reflect"

	central "github.com/stackrox/rox/generated/internalapi/central"
	sensor "github.com/stackrox/rox/generated/internalapi/sensor"
	storage "github.com/stackrox/rox/generated/storage"
	concurrency "github.com/stackrox/rox/pkg/concurrency"
	gomock "go.uber.org/mock/gomock"
)

// MockSettingsManager is a mock of SettingsManager interface.
type MockSettingsManager struct {
	ctrl     *gomock.Controller
	recorder *MockSettingsManagerMockRecorder
}

// MockSettingsManagerMockRecorder is the mock recorder for MockSettingsManager.
type MockSettingsManagerMockRecorder struct {
	mock *MockSettingsManager
}

// NewMockSettingsManager creates a new mock instance.
func NewMockSettingsManager(ctrl *gomock.Controller) *MockSettingsManager {
	mock := &MockSettingsManager{ctrl: ctrl}
	mock.recorder = &MockSettingsManagerMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockSettingsManager) EXPECT() *MockSettingsManagerMockRecorder {
	return m.recorder
}

// FlushCache mocks base method.
func (m *MockSettingsManager) FlushCache() {
	m.ctrl.T.Helper()
	m.ctrl.Call(m, "FlushCache")
}

// FlushCache indicates an expected call of FlushCache.
func (mr *MockSettingsManagerMockRecorder) FlushCache() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "FlushCache", reflect.TypeOf((*MockSettingsManager)(nil).FlushCache))
}

// GetResourcesForSync mocks base method.
func (m *MockSettingsManager) GetResourcesForSync() []*sensor.AdmCtrlUpdateResourceRequest {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetResourcesForSync")
	ret0, _ := ret[0].([]*sensor.AdmCtrlUpdateResourceRequest)
	return ret0
}

// GetResourcesForSync indicates an expected call of GetResourcesForSync.
func (mr *MockSettingsManagerMockRecorder) GetResourcesForSync() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetResourcesForSync", reflect.TypeOf((*MockSettingsManager)(nil).GetResourcesForSync))
}

// SensorEventsStream mocks base method.
func (m *MockSettingsManager) SensorEventsStream() concurrency.ReadOnlyValueStream[*sensor.AdmCtrlUpdateResourceRequest] {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "SensorEventsStream")
	ret0, _ := ret[0].(concurrency.ReadOnlyValueStream[*sensor.AdmCtrlUpdateResourceRequest])
	return ret0
}

// SensorEventsStream indicates an expected call of SensorEventsStream.
func (mr *MockSettingsManagerMockRecorder) SensorEventsStream() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "SensorEventsStream", reflect.TypeOf((*MockSettingsManager)(nil).SensorEventsStream))
}

// SettingsStream mocks base method.
func (m *MockSettingsManager) SettingsStream() concurrency.ReadOnlyValueStream[*sensor.AdmissionControlSettings] {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "SettingsStream")
	ret0, _ := ret[0].(concurrency.ReadOnlyValueStream[*sensor.AdmissionControlSettings])
	return ret0
}

// SettingsStream indicates an expected call of SettingsStream.
func (mr *MockSettingsManagerMockRecorder) SettingsStream() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "SettingsStream", reflect.TypeOf((*MockSettingsManager)(nil).SettingsStream))
}

// UpdateConfig mocks base method.
func (m *MockSettingsManager) UpdateConfig(config *storage.DynamicClusterConfig) {
	m.ctrl.T.Helper()
	m.ctrl.Call(m, "UpdateConfig", config)
}

// UpdateConfig indicates an expected call of UpdateConfig.
func (mr *MockSettingsManagerMockRecorder) UpdateConfig(config interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "UpdateConfig", reflect.TypeOf((*MockSettingsManager)(nil).UpdateConfig), config)
}

// UpdatePolicies mocks base method.
func (m *MockSettingsManager) UpdatePolicies(allPolicies []*storage.Policy) {
	m.ctrl.T.Helper()
	m.ctrl.Call(m, "UpdatePolicies", allPolicies)
}

// UpdatePolicies indicates an expected call of UpdatePolicies.
func (mr *MockSettingsManagerMockRecorder) UpdatePolicies(allPolicies interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "UpdatePolicies", reflect.TypeOf((*MockSettingsManager)(nil).UpdatePolicies), allPolicies)
}

// UpdateResources mocks base method.
func (m *MockSettingsManager) UpdateResources(events ...*central.SensorEvent) {
	m.ctrl.T.Helper()
	varargs := []interface{}{}
	for _, a := range events {
		varargs = append(varargs, a)
	}
	m.ctrl.Call(m, "UpdateResources", varargs...)
}

// UpdateResources indicates an expected call of UpdateResources.
func (mr *MockSettingsManagerMockRecorder) UpdateResources(events ...interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "UpdateResources", reflect.TypeOf((*MockSettingsManager)(nil).UpdateResources), events...)
}
