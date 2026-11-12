import DataArsip from "./DataArsip";

function ArsipList() {
  return (
    <div className="container">
      <h1>Daftar Arsip Inaktif</h1>

      <div className="card">
        <ArsipTable />
      </div>
    </div>
  );
}

export default ArsipList;
