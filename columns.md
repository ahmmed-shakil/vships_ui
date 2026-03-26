## sensor_data

| Column                | Type                                |
| --------------------- | ----------------------------------- |
| id                    | BIGINT GENERATED ALWAYS AS IDENTITY |
| device_id             | INTEGER NOT NULL                    |
| create_datetime       | TIMESTAMPTZ NOT NULL DEFAULT NOW()  |
| vessel_id             | INTEGER                             |
| asset_id              | VARCHAR(20)                         |
| tc_rpm                | DOUBLE PRECISION                    |
| fpi                   | DOUBLE PRECISION                    |
| rpm                   | DOUBLE PRECISION                    |
| eg_temp_1             | DOUBLE PRECISION                    |
| eg_temp_2             | DOUBLE PRECISION                    |
| eg_temp_3             | DOUBLE PRECISION                    |
| eg_temp_4             | DOUBLE PRECISION                    |
| eg_temp_5             | DOUBLE PRECISION                    |
| eg_temp_6             | DOUBLE PRECISION                    |
| eg_temp_7             | DOUBLE PRECISION                    |
| eg_temp_8             | DOUBLE PRECISION                    |
| eg_temp_compensator   | DOUBLE PRECISION                    |
| eg_temp_out_turbo     | DOUBLE PRECISION                    |
| eg_temp_mean          | DOUBLE PRECISION                    |
| eg_temp_dev_1         | DOUBLE PRECISION                    |
| eg_temp_dev_2         | DOUBLE PRECISION                    |
| eg_temp_dev_3         | DOUBLE PRECISION                    |
| eg_temp_dev_4         | DOUBLE PRECISION                    |
| eg_temp_dev_5         | DOUBLE PRECISION                    |
| eg_temp_dev_6         | DOUBLE PRECISION                    |
| eg_temp_dev_7         | DOUBLE PRECISION                    |
| eg_temp_dev_8         | DOUBLE PRECISION                    |
| exh_gas_limit         | DOUBLE PRECISION                    |
| exh_gas_temp          | DOUBLE PRECISION                    |
| fo_press_inlet        | DOUBLE PRECISION                    |
| lo_press              | DOUBLE PRECISION                    |
| ht_cw_press           | DOUBLE PRECISION                    |
| lt_cw_press           | DOUBLE PRECISION                    |
| startair_press        | DOUBLE PRECISION                    |
| chargeair_press       | DOUBLE PRECISION                    |
| lo_temp               | DOUBLE PRECISION                    |
| ht_cw_temp            | DOUBLE PRECISION                    |
| lt_cw_temp            | DOUBLE PRECISION                    |
| ht_cw_inlet_temp      | DOUBLE PRECISION                    |
| chargeair_temp        | DOUBLE PRECISION                    |
| fo_flow_inlet         | DOUBLE PRECISION                    |
| fo_flow_outlet        | DOUBLE PRECISION                    |
| gen_voltage           | DOUBLE PRECISION                    |
| bus_voltage           | DOUBLE PRECISION                    |
| bus_freq              | DOUBLE PRECISION                    |
| gen_freq              | DOUBLE PRECISION                    |
| phase_diff            | DOUBLE PRECISION                    |
| cos_phi               | DOUBLE PRECISION                    |
| exhaust_gas_temp_diff | DOUBLE PRECISION                    |
| wind_u_temp_diff      | DOUBLE PRECISION                    |
| wind_v_temp_diff      | DOUBLE PRECISION                    |
| wind_w_temp_diff      | DOUBLE PRECISION                    |
| fo_srv_tk17_ps        | DOUBLE PRECISION                    |
| fo_srv_tk17_sb        | DOUBLE PRECISION                    |
| fo_tk3_ps             | DOUBLE PRECISION                    |
| fo_tk3_sb             | DOUBLE PRECISION                    |
| fo_tk5_ps             | DOUBLE PRECISION                    |
| fo_tk5_sb             | DOUBLE PRECISION                    |
| fo_tk6_ps             | DOUBLE PRECISION                    |
| fo_tk6_sb             | DOUBLE PRECISION                    |
| fo_tk7_ps             | DOUBLE PRECISION                    |
| fo_tk7_sb             | DOUBLE PRECISION                    |
| fo_tk8_ps             | DOUBLE PRECISION                    |
| fo_tk8_sb             | DOUBLE PRECISION                    |
| pw_flow               | DOUBLE PRECISION                    |
| cargo_fo_flow         | DOUBLE PRECISION                    |
| thrust_current        | DOUBLE PRECISION                    |
| thrust_servo_press    | DOUBLE PRECISION                    |
| cpp_servo_press       | DOUBLE PRECISION                    |
| gearbox_servo_temp    | DOUBLE PRECISION                    |
| gearbox_servo_press   | DOUBLE PRECISION                    |
| data                  | JSONB                               |

## nmea_data

| Column                 | Type                                |
| ---------------------- | ----------------------------------- |
| id                     | BIGINT GENERATED ALWAYS AS IDENTITY |
| device_id              | INTEGER NOT NULL                    |
| vessel_id              | INTEGER                             |
| latitude               | DOUBLE PRECISION                    |
| longitude              | DOUBLE PRECISION                    |
| vessel_heading         | DOUBLE PRECISION                    |
| distance_over_ground   | DOUBLE PRECISION                    |
| distance_through_water | DOUBLE PRECISION                    |
| speed_over_ground      | DOUBLE PRECISION                    |
| speed_through_water    | DOUBLE PRECISION                    |
| depth_meters           | DOUBLE PRECISION                    |
| wind_angle             | DOUBLE PRECISION                    |
| wind_speed             | DOUBLE PRECISION                    |
| var_dir                | VARCHAR(10)                         |
| reference              | VARCHAR(10)                         |
| wind_speed_units       | VARCHAR(10)                         |
| device_datetime        | TIMESTAMPTZ                         |
| message_datetime       | TIMESTAMPTZ                         |
| created_datetime       | TIMESTAMPTZ NOT NULL DEFAULT NOW()  |
| update_datetime        | TIMESTAMPTZ NOT NULL DEFAULT NOW()  |
