// Code generated by pg-bindings generator. DO NOT EDIT.

//go:build sql_integration

package postgres

import (
	"context"
	"testing"

	"github.com/stackrox/rox/generated/storage"
	"github.com/stackrox/rox/pkg/env"
	"github.com/stackrox/rox/pkg/postgres/pgtest"
	"github.com/stackrox/rox/pkg/sac"
	"github.com/stackrox/rox/pkg/testutils"
	"github.com/stackrox/rox/pkg/testutils/envisolator"
	"github.com/stretchr/testify/suite"
)

type ClusterHealthStatusesStoreSuite struct {
	suite.Suite
	envIsolator *envisolator.EnvIsolator
	store       Store
	testDB      *pgtest.TestPostgres
}

func TestClusterHealthStatusesStore(t *testing.T) {
	suite.Run(t, new(ClusterHealthStatusesStoreSuite))
}

func (s *ClusterHealthStatusesStoreSuite) SetupSuite() {
	s.envIsolator = envisolator.NewEnvIsolator(s.T())
	s.envIsolator.Setenv(env.PostgresDatastoreEnabled.EnvVar(), "true")

	if !env.PostgresDatastoreEnabled.BooleanSetting() {
		s.T().Skip("Skip postgres store tests")
		s.T().SkipNow()
	}

	s.testDB = pgtest.ForT(s.T())
	s.store = New(s.testDB.Pool)
}

func (s *ClusterHealthStatusesStoreSuite) SetupTest() {
	ctx := sac.WithAllAccess(context.Background())
	tag, err := s.testDB.Exec(ctx, "TRUNCATE cluster_health_statuses CASCADE")
	s.T().Log("cluster_health_statuses", tag)
	s.NoError(err)
}

func (s *ClusterHealthStatusesStoreSuite) TearDownSuite() {
	s.testDB.Teardown(s.T())
	s.envIsolator.RestoreAll()
}

func (s *ClusterHealthStatusesStoreSuite) TestStore() {
	ctx := sac.WithAllAccess(context.Background())

	store := s.store

	clusterHealthStatus := &storage.ClusterHealthStatus{}
	s.NoError(testutils.FullInit(clusterHealthStatus, testutils.SimpleInitializer(), testutils.JSONFieldsFilter))

	foundClusterHealthStatus, exists, err := store.Get(ctx, clusterHealthStatus.GetId())
	s.NoError(err)
	s.False(exists)
	s.Nil(foundClusterHealthStatus)

	withNoAccessCtx := sac.WithNoAccess(ctx)

	s.NoError(store.Upsert(ctx, clusterHealthStatus))
	foundClusterHealthStatus, exists, err = store.Get(ctx, clusterHealthStatus.GetId())
	s.NoError(err)
	s.True(exists)
	s.Equal(clusterHealthStatus, foundClusterHealthStatus)

	clusterHealthStatusCount, err := store.Count(ctx)
	s.NoError(err)
	s.Equal(1, clusterHealthStatusCount)
	clusterHealthStatusCount, err = store.Count(withNoAccessCtx)
	s.NoError(err)
	s.Zero(clusterHealthStatusCount)

	clusterHealthStatusExists, err := store.Exists(ctx, clusterHealthStatus.GetId())
	s.NoError(err)
	s.True(clusterHealthStatusExists)
	s.NoError(store.Upsert(ctx, clusterHealthStatus))
	s.ErrorIs(store.Upsert(withNoAccessCtx, clusterHealthStatus), sac.ErrResourceAccessDenied)

	foundClusterHealthStatus, exists, err = store.Get(ctx, clusterHealthStatus.GetId())
	s.NoError(err)
	s.True(exists)
	s.Equal(clusterHealthStatus, foundClusterHealthStatus)

	s.NoError(store.Delete(ctx, clusterHealthStatus.GetId()))
	foundClusterHealthStatus, exists, err = store.Get(ctx, clusterHealthStatus.GetId())
	s.NoError(err)
	s.False(exists)
	s.Nil(foundClusterHealthStatus)
	s.NoError(store.Delete(withNoAccessCtx, clusterHealthStatus.GetId()))

	var clusterHealthStatuss []*storage.ClusterHealthStatus
	var clusterHealthStatusIDs []string
	for i := 0; i < 200; i++ {
		clusterHealthStatus := &storage.ClusterHealthStatus{}
		s.NoError(testutils.FullInit(clusterHealthStatus, testutils.UniqueInitializer(), testutils.JSONFieldsFilter))
		clusterHealthStatuss = append(clusterHealthStatuss, clusterHealthStatus)
		clusterHealthStatusIDs = append(clusterHealthStatusIDs, clusterHealthStatus.GetId())
	}

	s.NoError(store.UpsertMany(ctx, clusterHealthStatuss))

	clusterHealthStatusCount, err = store.Count(ctx)
	s.NoError(err)
	s.Equal(200, clusterHealthStatusCount)

	s.NoError(store.DeleteMany(ctx, clusterHealthStatusIDs))

	clusterHealthStatusCount, err = store.Count(ctx)
	s.NoError(err)
	s.Equal(0, clusterHealthStatusCount)
}
