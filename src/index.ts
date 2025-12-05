// src/index.ts

export type QueryType = 'select' | 'insert' | 'update' | 'delete';
export type OrderDirection = 'ASC' | 'DESC';
export type Primitive = string | number | boolean | null | undefined;

interface BuiltQuery {
    sql: string;
    params: Primitive[];
}

class BabySQLBuilder {
    private type: QueryType;
    private table: string;

    private _columns: string[] = [];
    private _data: Record<string, Primitive> | null = null;

    private _wheres: { sql: string; params: Primitive[]; connector: 'AND' | 'OR' }[] = [];
    private _order: { col: string; dir: OrderDirection }[] = [];

    private _limit?: number;
    private _offset?: number;

    constructor(type: QueryType, table: string) {
        this.type = type;
        this.table = table;
    }

    /** 用于 insert/update 的数据 */
    data(obj: Record<string, Primitive>): this {
        this._data = { ...obj };
        return this;
    }

    /** select 的字段 */
    columns(cols: string[] | string): this {
        this._columns = Array.isArray(cols) ? cols : [cols];
        return this;
    }

    /** where 子句 */
    where(column: string, op: string, value: Primitive, connector: 'AND' | 'OR' = 'AND'): this {
        this._wheres.push({
            sql: `${column} ${op} ?`,
            params: [value],
            connector
        });
        return this;
    }

    /** 模糊查询 whereLike */
    whereLike(column: string, value: string, mode: 'both' | 'left' | 'right' = 'both', connector: 'AND' | 'OR' = 'AND'): this {
        let val = value;
        if (mode === 'both') val = `%${val}%`;
        else if (mode === 'left') val = `%${val}`;
        else if (mode === 'right') val = `${val}%`;

        this._wheres.push({
            sql: `${column} LIKE ?`,
            params: [val],
            connector
        });
        return this;
    }

    /** whereIn */
    whereIn(column: string, values: Primitive[], connector: 'AND' | 'OR' = 'AND'): this {
        if (!values.length) {
            this._wheres.push({ sql: '1=0', params: [], connector });
            return this;
        }
        const placeholders = values.map(() => '?').join(', ');
        this._wheres.push({
            sql: `${column} IN (${placeholders})`,
            params: values,
            connector
        });
        return this;
    }

    /** whereRaw */
    whereRaw(sql: string, params: Primitive[] = [], connector: 'AND' | 'OR' = 'AND'): this {
        this._wheres.push({
            sql: `(${sql})`,
            params,
            connector
        });
        return this;
    }

    /** 排序 */
    orderBy(column: string, dir: OrderDirection = 'ASC'): this {
        this._order.push({ col: column, dir });
        return this;
    }

    limit(n: number): this {
        this._limit = Math.max(0, n | 0);
        return this;
    }

    offset(n: number): this {
        this._offset = Math.max(0, n | 0);
        return this;
    }

    paginate(page: number, pageSize: number): this {
        const p = Math.max(1, page | 0);
        const size = Math.max(1, pageSize | 0);
        this._limit = size;
        this._offset = (p - 1) * size;
        return this;
    }

    /** 最终构建 SQL */
    build(): BuiltQuery {
        const params: Primitive[] = [];
        let sql = '';

        // ----------- SELECT -----------
        if (this.type === 'select') {
            const cols = this._columns.length ? this._columns.join(', ') : '*';
            sql = `SELECT ${cols} FROM ${this.table}`;
        }

        // ----------- INSERT -----------
        else if (this.type === 'insert') {
            if (!this._data) throw new Error('insert() 需要先调用 data()');
            const keys = Object.keys(this._data);
            const placeholders = keys.map(() => '?').join(', ');
            sql = `INSERT INTO ${this.table} (${keys.join(', ')}) VALUES (${placeholders})`;
            params.push(...keys.map(k => this._data![k]));
            return { sql, params }; // insert 没有 where/order/limit
        }

        // ----------- UPDATE -----------
        else if (this.type === 'update') {
            if (!this._data) throw new Error('update() 需要先调用 data()');
            const keys = Object.keys(this._data);
            const sets = keys.map(k => `${k} = ?`).join(', ');
            sql = `UPDATE ${this.table} SET ${sets}`;
            params.push(...keys.map(k => this._data![k]));
        }

        // ----------- DELETE -----------
        else if (this.type === 'delete') {
            sql = `DELETE FROM ${this.table}`;
        }

        // ----------- WHERE -----------
        if (this._wheres.length > 0) {
            const parts: string[] = [];
            for (let i = 0; i < this._wheres.length; i++) {
                const w = this._wheres[i];
                if (i === 0) parts.push(w.sql);
                else parts.push(`${w.connector} ${w.sql}`);
                params.push(...w.params);
            }
            sql += ` WHERE ${parts.join(' ')}`;
        }

        // ----------- ORDER BY -----------
        if (this._order.length && this.type === 'select') {
            const orderSql = this._order
                .map(o => `${o.col} ${o.dir}`)
                .join(', ');
            sql += ` ORDER BY ${orderSql}`;
        }

        // ----------- LIMIT / OFFSET -----------
        if (typeof this._limit === 'number') {
            sql += ` LIMIT ?`;
            params.push(this._limit);

            if (typeof this._offset === 'number') {
                sql += ` OFFSET ?`;
                params.push(this._offset);
            }
        } else if (typeof this._offset === 'number') {
            // 不推荐但可以支持 offset without limit（某些数据库不允许）
            sql += ` OFFSET ?`;
            params.push(this._offset);
        }

        return { sql, params };
    }
}

/** 顶层工厂：直接指定操作 + 表名 */
export default class BabySQL {
    static select(table: string) {
        return new BabySQLBuilder('select', table);
    }

    static insert(table: string) {
        return new BabySQLBuilder('insert', table);
    }

    static update(table: string) {
        return new BabySQLBuilder('update', table);
    }

    static delete(table: string) {
        return new BabySQLBuilder('delete', table);
    }
}