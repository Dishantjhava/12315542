const { fetchDepots, fetchVehicles } = require('../services/externalApi.service');
const { knapsack } = require('../services/knapsack.service');
const { Log } = require('../middleware/logger');

const getDepots = async (req, res, next) => {
  try {
    Log('backend', 'info', 'controller', 'Fetching depots from external API');
    const depots = await fetchDepots();
    Log('backend', 'info', 'controller', `Fetched ${depots.length} depots`);
    res.json({ success: true, count: depots.length, depots });
  } catch (err) {
    Log('backend', 'error', 'controller', 'Depot fetch failed');
    next(err);
  }
};

const getVehicles = async (req, res, next) => {
  try {
    Log('backend', 'info', 'controller', 'Fetching vehicles from external API');
    const vehicles = await fetchVehicles();
    Log('backend', 'info', 'controller', `Fetched ${vehicles.length} vehicles`);
    res.json({ success: true, count: vehicles.length, vehicles });
  } catch (err) {
    Log('backend', 'error', 'controller', 'Vehicle fetch failed');
    next(err);
  }
};

const optimizeForDepot = async (req, res, next) => {
  try {
    const depotId = parseInt(req.params.depotId);

    if (isNaN(depotId)) {
      Log('backend', 'warn', 'controller', 'Invalid depotId param received');
      return res.status(400).json({ success: false, error: 'depotId must be a number' });
    }

    Log('backend', 'info', 'controller', `Optimising depot ${depotId}`);

    const [depots, vehicles] = await Promise.all([fetchDepots(), fetchVehicles()]);
    const depot = depots.find(d => d.ID === depotId);

    if (!depot) {
      Log('backend', 'warn', 'controller', `Depot ${depotId} not found`);
      return res.status(404).json({ success: false, error: `Depot ${depotId} not found` });
    }

    const result = knapsack(depot.MechanicHours, vehicles);
    Log('backend', 'info', 'controller', `Depot ${depotId} done: impact=${result.maxImpact}`);

    res.json({
      success: true,
      depot: { ID: depot.ID, MechanicHours: depot.MechanicHours },
      schedule: {
        maxImpactScore: result.maxImpact,
        totalDurationUsed: result.totalDuration,
        unusedHours: result.unusedHours,
        taskCount: result.selectedTasks.length,
        selectedTasks: result.selectedTasks,
      },
    });
  } catch (err) {
    Log('backend', 'error', 'controller', 'Depot optimisation error');
    next(err);
  }
};

const optimizeAll = async (req, res, next) => {
  try {
    Log('backend', 'info', 'controller', 'Optimising all depots');

    const [depots, vehicles] = await Promise.all([fetchDepots(), fetchVehicles()]);

    const schedules = depots.map(depot => {
      const result = knapsack(depot.MechanicHours, vehicles);
      Log('backend', 'info', 'controller', `Depot ${depot.ID}: impact=${result.maxImpact}`);
      return {
        depot: { ID: depot.ID, MechanicHours: depot.MechanicHours },
        schedule: {
          maxImpactScore: result.maxImpact,
          totalDurationUsed: result.totalDuration,
          unusedHours: result.unusedHours,
          taskCount: result.selectedTasks.length,
          selectedTasks: result.selectedTasks,
        },
      };
    });

    const grandTotal = schedules.reduce((sum, s) => sum + s.schedule.maxImpactScore, 0);
    Log('backend', 'info', 'controller', `All depots done: total=${grandTotal}`);

    res.json({
      success: true,
      summary: {
        totalDepots: depots.length,
        totalVehicles: vehicles.length,
        grandTotalImpactScore: grandTotal,
      },
      schedules,
    });
  } catch (err) {
    Log('backend', 'error', 'controller', 'All-depot optimisation failed');
    next(err);
  }
};

module.exports = { getDepots, getVehicles, optimizeForDepot, optimizeAll };
