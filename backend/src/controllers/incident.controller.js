const pool = require('../db');

// Obtener todas las incidencias
const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM incidencias ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Crear una o multiples incidencias (sincronizacion)
const create = async (req, res) => {
  try {
    const data = req.body;
    const isArray = Array.isArray(data);
    const incidents = isArray ? data : [data];

    if (incidents.length === 0) {
      return res.status(400).json({ success: false, message: 'No se enviaron datos' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const incident of incidents) {
        // Upsert logic (Insert or Update if exists by codigo)
        const sql = `
          INSERT INTO incidencias 
          (codigo, titulo, descripcion, categoria, prioridad, estado, solicitante, tecnicoAsignado, fechaCreacion, fechaActualizacion) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
          titulo = VALUES(titulo),
          descripcion = VALUES(descripcion),
          categoria = VALUES(categoria),
          prioridad = VALUES(prioridad),
          estado = VALUES(estado),
          solicitante = VALUES(solicitante),
          tecnicoAsignado = VALUES(tecnicoAsignado),
          fechaActualizacion = VALUES(fechaActualizacion)
        `;

        const values = [
          incident.codigo,
          incident.titulo,
          incident.descripcion,
          incident.categoria,
          incident.prioridad,
          incident.estado,
          incident.solicitante,
          incident.tecnicoAsignado || null,
          incident.fechaCreacion,
          incident.fechaActualizacion
        ];

        await connection.query(sql, values);
      }

      await connection.commit();
      res.status(201).json({ success: true, message: 'Operacion completada' });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al procesar la solicitud' });
  }
};

// Actualizar una incidencia
const update = async (req, res) => {
  try {
    const { id } = req.params; // codigo
    const { titulo, descripcion, categoria, prioridad, estado, solicitante, tecnicoAsignado, fechaActualizacion } = req.body;

    const sql = `
      UPDATE incidencias 
      SET titulo=?, descripcion=?, categoria=?, prioridad=?, estado=?, solicitante=?, tecnicoAsignado=?, fechaActualizacion=?
      WHERE codigo=?
    `;
    const values = [titulo, descripcion, categoria, prioridad, estado, solicitante, tecnicoAsignado || null, fechaActualizacion, id];

    const [result] = await pool.query(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Incidencia no encontrada' });
    }
    res.json({ success: true, message: 'Incidencia actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Eliminar una incidencia
const remove = async (req, res) => {
  try {
    const { id } = req.params; // codigo
    const [result] = await pool.query('DELETE FROM incidencias WHERE codigo=?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Incidencia no encontrada' });
    }
    res.json({ success: true, message: 'Incidencia eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

module.exports = {
  getAll,
  create,
  update,
  remove
};
