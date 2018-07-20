package store

import (
	"fmt"
	"testing"

	"bitbucket.org/stack-rox/apollo/generated/api/v1"
	"bitbucket.org/stack-rox/apollo/pkg/bolthelper"
	"bitbucket.org/stack-rox/apollo/pkg/fixtures"
	"bitbucket.org/stack-rox/apollo/pkg/uuid"
	"github.com/gogo/protobuf/proto"
	"github.com/gogo/protobuf/types"
)

const maxGRPCSize = 4194304

func getAlertStore(b *testing.B) Store {
	db, err := bolthelper.NewTemp(b.Name() + ".db")
	if err != nil {
		b.Fatal(err)
	}
	return New(db)
}

func BenchmarkAddAlert(b *testing.B) {
	store := getAlertStore(b)
	alert := fixtures.GetAlert()
	for i := 0; i < b.N; i++ {
		store.AddAlert(alert)
	}
}

func BenchmarkUpdateAlert(b *testing.B) {
	store := getAlertStore(b)
	alert := fixtures.GetAlert()
	for i := 0; i < b.N; i++ {
		store.UpdateAlert(alert)
	}
}

func BenchmarkGetAlert(b *testing.B) {
	store := getAlertStore(b)
	alert := fixtures.GetAlert()
	store.AddAlert(alert)
	for i := 0; i < b.N; i++ {
		store.GetAlert(alert.GetId())
	}
}

// This really isn't a benchmark, but just prints out how many ListAlerts can be returned in an API call
func BenchmarkListAlerts(b *testing.B) {
	listAlert := &v1.ListAlert{
		Id:   uuid.NewDummy().String(),
		Time: types.TimestampNow(),
		Policy: &v1.ListAlertPolicy{
			Id:          uuid.NewV4().String(),
			Name:        "this is my policy name",
			Severity:    v1.Severity_MEDIUM_SEVERITY,
			Description: "this is my description and it's fairly long, but typically descriptions are fairly long",
			Categories:  []string{"Category 1", "Category 2", "Category 3"},
		},
		Deployment: &v1.ListAlertDeployment{
			Id:          uuid.NewV4().String(),
			Name:        "quizzical_cat",
			UpdatedAt:   types.TimestampNow(),
			ClusterName: "remote",
		},
	}

	bytes, _ := proto.Marshal(listAlert)
	fmt.Printf("Max ListAlerts that can be returned: %d\n", maxGRPCSize/len(bytes))
}
