export interface Service {
	initialize(): Promise<void>
	terminate(): Promise<void>
}
