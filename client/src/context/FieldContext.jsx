import React, { createContext, useContext, useState, useEffect } from 'react';
import { fieldAPI, profileAPI } from '../services/api';

const FieldContext = createContext();

export function FieldProvider({ children }) {
  const [currentFieldId, setCurrentFieldId] = useState('field_tn01');
  const [fieldToday, setFieldToday] = useState(null);
  const [fieldList, setFieldList] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFieldData = async (id = currentFieldId) => {
    try {
      setLoading(true);
      setError(null);
      const [todayRes, fieldsRes] = await Promise.all([
        fieldAPI.getFieldToday(id),
        fieldAPI.getFields()
      ]);

      setFieldToday(todayRes.data);
      setFieldList(fieldsRes.data.fields || []);
      setCurrentFieldId(id);
    } catch (err) {
      console.warn('Field data fetch error', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await profileAPI.getProfile();
      setProfile(res.data);
      if (res.data.fieldId) {
        setCurrentFieldId(res.data.fieldId);
      }
    } catch (e) {
      // Unauthenticated or profile missing
    }
  };

  useEffect(() => {
    fetchFieldData(currentFieldId);
    fetchProfile();
  }, []);

  const switchField = (id) => {
    setCurrentFieldId(id);
    fetchFieldData(id);
  };

  return (
    <FieldContext.Provider value={{
      currentFieldId,
      fieldToday,
      fieldList,
      profile,
      loading,
      error,
      switchField,
      refreshFieldData: () => fetchFieldData(currentFieldId),
      setProfile
    }}>
      {children}
    </FieldContext.Provider>
  );
}

export const useField = () => useContext(FieldContext);
