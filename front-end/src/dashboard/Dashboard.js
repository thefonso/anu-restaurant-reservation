import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

// Import Utility Functions
import { next, previous, today } from "../utils/date-time";
import { listReservations, listTable, finishReservation } from "../utils/api";

// Import Components
import ReservationList from "../reservations/ReservationList";
import TableList from "../tables/TableList";
import ErrorAlert from "../layout/ErrorAlert";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);

  const history = useHistory();

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  // Functionality for finishing reservations
  const handleFinishReservation = async (table_id) => {
    const abortController = new AbortController();
    const confirm = window.confirm(
      "Is this table ready to seat new guests?\nThis cannot be undone."
    );
    if (confirm) {
      try {
        await finishReservation(table_id, abortController.signal);
        loadDashboard();
        loadTables();
      } catch (error) {
        console.log(error);
      }
    }
    return () => abortController.abort();
  };

  // Functionality for Previous and Next day buttons
  function previousDay(date) {
    const previousDate = previous(date);
    history.push(`/dashboard?date=${previousDate}`);
  }

  function nextDay(date) {
    const nextDate = next(date);
    history.push(`/dashboard?date=${nextDate}`);
  }

  useEffect(loadTables, []);

  function loadTables() {
    const abortController = new AbortController();
    listTable(abortController.signal).then(setTables);
    return () => abortController.abort();
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Today's Date: {date}</h4>
      </div>

      <div className="btn-toolbar mb-2 mb-md-0">
        <div className="btn-group me-2">
          <button
            type="button"
            className="btn btn-secondary m-1 mt-2"
            onClick={() => previousDay(date)}
          >
            Previous
          </button>
          <button
            type="button"
            className="btn btn-primary m-1 mt-2"
            onClick={() => history.push(`/dashboard?date=${today()}`)}
          >
            Today
          </button>
          <button
            type="button"
            className="btn btn-secondary m-1 mt-2"
            onClick={() => nextDay(date)}
          >
            Next
          </button>
        </div>
      </div>

      <ErrorAlert error={reservationsError} />
      <ReservationList
        reservations={reservations}
        loadDashboard={loadDashboard}
      />
      <TableList
        tables={tables}
        handleFinishReservation={handleFinishReservation}
      />
    </main>
  );
}

export default Dashboard;
