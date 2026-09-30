"""
AarogyaGrid AI - Simulated Federated Learning Demonstration
Phase 8: Federated AI Simulation (3 Regional Nodes: Delhi, UP, Rajasthan)

Demonstrates Federated Averaging (FedAvg) where each state trains locally on its private dataset,
transmitting only model coefficients/weights (no raw patient or inventory records).
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, root_mean_squared_error

class FederatedNode:
    def __init__(self, node_id: str, state_name: str, sample_size: int = 120, noise_scale: float = 0.1):
        self.node_id = node_id
        self.state_name = state_name
        self.sample_size = sample_size
        self.noise_scale = noise_scale
        self.model = Ridge(alpha=1.0)
        self.local_data = self._generate_private_local_data()

    def _generate_private_local_data(self) -> pd.DataFrame:
        """
        Generates simulated local time-series records that NEVER leave this node.
        """
        np.random.seed(abs(hash(self.node_id)) % 100000)
        
        # Features: [lag_1, lag_7, patients, outbreak_flag]
        lag_1 = np.random.uniform(20.0, 100.0, self.sample_size)
        lag_7 = lag_1 + np.random.normal(0, 5.0, self.sample_size)
        patients = lag_1 * 2.5 + np.random.normal(0, 15.0, self.sample_size)
        outbreak = np.random.choice([0, 1], size=self.sample_size, p=[0.85, 0.15])

        # Underlying true relationship with regional variation
        true_w = np.array([0.45, 0.25, 0.12, 18.0])
        noise = np.random.normal(0, self.noise_scale * 10.0, self.sample_size)
        usage = (0.45 * lag_1 + 0.25 * lag_7 + 0.12 * patients + 18.0 * outbreak + 5.0 + noise)

        return pd.DataFrame({
            "lag_1": lag_1,
            "lag_7": lag_7,
            "patients": patients,
            "outbreak": outbreak,
            "usage": usage
        })

    def train_local_round(self) -> Dict[str, Any]:
        """
        Trains model locally on private data and extracts weights.
        """
        X = self.local_data[["lag_1", "lag_7", "patients", "outbreak"]]
        y = self.local_data["usage"]

        # 80/20 train/val split
        split = int(len(X) * 0.8)
        X_train, y_train = X.iloc[:split], y.iloc[:split]
        X_val, y_val = X.iloc[split:], y.iloc[split:]

        self.model.fit(X_train, y_train)
        y_pred = self.model.predict(X_val)

        mae = float(mean_absolute_error(y_val, y_pred))
        rmse = float(root_mean_squared_error(y_val, y_pred))

        return {
            "nodeId": self.node_id,
            "state": self.state_name,
            "sampleCount": len(X_train),
            "weights": self.model.coef_.tolist(),
            "intercept": float(self.model.intercept_),
            "localMAE": round(mae, 2),
            "localRMSE": round(rmse, 2)
        }

    def evaluate_global_model(self, global_weights: List[float], global_intercept: float) -> Dict[str, float]:
        """
        Evaluates the aggregated federated model on this node's private validation set.
        """
        X = self.local_data[["lag_1", "lag_7", "patients", "outbreak"]]
        y = self.local_data["usage"]
        split = int(len(X) * 0.8)
        X_val, y_val = X.iloc[split:], y.iloc[split:]

        # Create temporary model with global parameters
        eval_model = Ridge(alpha=1.0)
        eval_model.coef_ = np.array(global_weights)
        eval_model.intercept_ = global_intercept

        y_pred = eval_model.predict(X_val)
        return {
            "globalModelMAE": round(float(mean_absolute_error(y_val, y_pred)), 2),
            "globalModelRMSE": round(float(root_mean_squared_error(y_val, y_pred)), 2)
        }


class FederatedCoordinator:
    def __init__(self):
        self.nodes = [
            FederatedNode(node_id="node-delhi", state_name="Delhi-NCR", sample_size=150),
            FederatedNode(node_id="node-up", state_name="Uttar Pradesh", sample_size=200),
            FederatedNode(node_id="node-raj", state_name="Rajasthan", sample_size=120)
        ]
        self.global_weights: List[float] = []
        self.global_intercept: float = 0.0

    def run_federated_round(self, round_num: int = 1) -> Dict[str, Any]:
        """
        Runs one complete round of Federated Averaging (FedAvg).
        """
        local_updates = []
        total_samples = 0

        # Step 1: Local Training at each state node
        for node in self.nodes:
            update = node.train_local_round()
            local_updates.append(update)
            total_samples += update["sampleCount"]

        # Step 2: Central Aggregation (Weighted FedAvg)
        aggregated_weights = np.zeros(len(local_updates[0]["weights"]))
        aggregated_intercept = 0.0

        for u in local_updates:
            weight_factor = u["sampleCount"] / total_samples
            aggregated_weights += weight_factor * np.array(u["weights"])
            aggregated_intercept += weight_factor * u["intercept"]

        self.global_weights = aggregated_weights.tolist()
        self.global_intercept = float(aggregated_intercept)

        # Step 3: Global Model Evaluation across all nodes
        evaluation_results = []
        for node in self.nodes:
            eval_res = node.evaluate_global_model(self.global_weights, self.global_intercept)
            evaluation_results.append({
                "nodeId": node.node_id,
                "state": node.state_name,
                "localValidationWithGlobalModel": eval_res
            })

        return {
            "federatedRound": round_num,
            "status": "COMPLETED",
            "disclosure": "Simulated demonstration: Node datasets remain strictly partitioned and isolated. Only model weights are aggregated.",
            "participatingNodes": len(self.nodes),
            "totalTrainingRecordsAcrossNodes": total_samples,
            "localNodeUpdates": local_updates,
            "aggregatedGlobalModel": {
                "weights": [round(w, 4) for w in self.global_weights],
                "intercept": round(self.global_intercept, 4),
                "featureNames": ["lag_1_usage", "lag_7_usage", "patient_footfall", "outbreak_flag"]
            },
            "nodeEvaluations": evaluation_results
        }
