package store

import (
	"github.com/gogo/protobuf/types"
	"github.com/stackrox/rox/generated/storage"
)

// GetMockResult returns a mock ComplianceRunResults object
func GetMockResult() (*storage.ComplianceRunResults, *storage.ComplianceDomain) {
	clusterID := "Test cluster ID"
	domainID := "a very good domain ID"
	result := &storage.ComplianceRunResults{
		RunMetadata: &storage.ComplianceRunMetadata{
			StandardId:      "yeet",
			Success:         true,
			RunId:           "Test run ID",
			ClusterId:       clusterID,
			FinishTimestamp: types.TimestampNow(),
			DomainId:        domainID,
		},
		ClusterResults: &storage.ComplianceRunResults_EntityResults{
			ControlResults: map[string]*storage.ComplianceResultValue{
				"test": {
					Evidence: []*storage.ComplianceResultValue_Evidence{
						{
							Message: "test",
						},
					},
					OverallState: 0,
				},
			},
		},
	}
	domain := &storage.ComplianceDomain{
		Id: domainID,
		Cluster: &storage.Cluster{
			Id: clusterID,
		},
	}
	return result, domain
}
