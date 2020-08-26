function getEvents(subId) {
	var strq = "sql: \n\
	declare @subId bigint =  " + subId + "; \n\
	select \n\
		d.name, -- Название \n\
		d.start_date, \n\
		d.finish_date, \n\
		d.event_category, --Категория мероприятия \n\
		d.event_subject, -- Блок \n\
		d.event_partner, --Наименование компании-партнера (партнерский канал) \n\
		d.education_name, --Учебная программа \n\
		d.event_learn, --Плановое/внеплановое обучение \n\
		d.event_form, --Форма проведения \n\
		d.event_city_place, --Город проведения \n\
		d.event_place, --Место проведения \n\
		d.education_org_name, --Провайдер \n\
		d.duration_days_fact, --Продожительность в днях \n\
		d.duration_fact, --Продожительность \n\
		cr1.fullname event_customer, --d.event_customer_id, --Заказчик \n\
		d.event_preparations, -- Ответственные за подготовку \n\
		d.event_lectors, -- Преподаватели \n\
		d.event_max_person_num, -- Максимальное количество участников \n\
		d.event_person_num, -- Плановое количество участников (сотрудники ВСК и Агенты) \n\
		d.event_fact_person_num, --Фактическое количество участников (сотрудники ВСК и Агенты) \n\
		d.event_plan_person_num, -- Планируемое количество участников (не сотрудников ВСК) \n\
		d.event_fact_person_num_1, -- Фактическое количество участников (не сотрудников ВСК) \n\
		d.event_status, -- Статус \n\
		d.event_type, -- Категория мероприятия \n\
		d.event_collaborators, -- ФИО обучаемых \n\
		d.event_comment -- Примечание \n\
	from ( \n\
		select \n\
			es.id, \n\
			es.start_date, \n\
			es.finish_date, \n\
			R.p.query('custom_elem/name[text() = \"f_dt42\"]/../value/text()').value('.', 'varchar(200)') event_category, \n\
			R.p.query('custom_elem/name[text() = \"subject_id\"]/../value/text()').value('.', 'varchar(200)') event_subject, \n\
			R.p.query('custom_elem/name[text() = \"f_nqu6\"]/../value/text()').value('.', 'varchar(200)') event_partner, \n\
			ems.name education_name, \n\
			R.p.query('custom_elem/name[text() = \"f_k45x\"]/../value/text()').value('.', 'varchar(200)') event_learn, \n\
			es.event_form, \n\
			ps.name event_city_place, \n\
			T.p.query('place').value('.', 'varchar(200)') event_place, \n\
			es.education_org_name, \n\
			es.duration_days_fact, \n\
			es.duration_fact, \n\
			R.p.query('custom_elem/name[text() = \"f_rnwz\"]/../value/text()').value('.', 'varchar(200)') event_customer_id, \n\
			es.name, \n\
			cast(T.p.query(' \n\
				for $el in even_preparations/even_preparation \n\
					return concat(data($el/person_fullname[1]), \", \") \n\
			') as varchar(max)) event_preparations, \n\
			(select stuff(\n\
				(select N', ' + lector_fullname from event_lectors where event_id = es.id for xml path(''), type) \n\
				.value('text()[1]','nvarchar(max)'), 1, 2, N'') \n\
			) event_lectors, \n\
			T.p.query('max_person_num').value('.', 'varchar(max)') event_max_person_num, \n\
			es.person_num event_person_num, \n\
			(select count(id) from event_results where is_assist = 1 and event_id = es.id) event_fact_person_num, \n\
			R.p.query('custom_elem/name[text() = \"f_0otz\"]/../value/text()').value('.', 'varchar(20)') event_plan_person_num, \n\
			R.p.query('custom_elem/name[text() = \"f_hxuc\"]/../value/text()').value('.', 'varchar(20)') event_fact_person_num_1, \n\
			cest.name event_status, \n\
			cet.name event_type, \n\
			cast(T.p.query(' \n\
				for $el in collaborators/collaborator \n\
					return concat(data($el/person_fullname[1]), \", \") \n\
			') as varchar(max)) event_collaborators, \n\
			T.p.query('comment').value('.', 'varchar(max)') event_comment, \n\
		T.p.query('doc_info/creation/user_id').value('.', 'bigint') user_created_id \n\
		from [events] es \n\
		inner join [event] ev on ev.id = es.id \n\
		left join [common.event_types] cet on cet.id = es.type_id \n\
		left join [common.event_status_types] cest on cest.id = es.status_id \n\
		left join places ps on ps.id = es.place_id \n\
		left join education_methods ems on ems.id = es.education_method_id \n\
		outer apply ev.data.nodes('/event/custom_elems') as R(p) \n\
		cross apply ev.data.nodes('/event') as T(p) \n\
	) d \n\
	left join event_results ecs on ecs.event_id = d.id \n\
	left join collaborator cr on cr.id = ecs.person_id \n\
	left join collaborators cr1 on cr1.id = d.event_customer_id \n\
	outer apply cr.data.nodes('/collaborator') as C(d) \n\
	where \n\
		((C.d.exist('path_subs/path_sub/id[text()[1] = string(sql:variable(\"@subId\"))]') = 1) or @subId = 0) \n\
	";

	return XQuery(strq);
}

function getLearnings(subId, _subordinates, _learnings) {
	var s = _subordinates.join('),(');
	var l = _learnings.join('),(');

	var strq = "sql: \n\
		declare @_subordinates table (id bigint); \n\
		" + (_subordinates.length == 0 ? '' : 'insert into @_subordinates (id) values (' + s + ');') + " \n\
		declare @_subordinatesCount int = (select count(id) from @_subordinates); \n\
		\n\
		declare @_learnings table (id bigint); \n\
		" + (_learnings.length == 0 ? '' : 'insert into @_learnings (id) values (' + l + ');') + " \n\
		declare @_learningsCount int = (select count(id) from @_learnings); \n\
		\n\
		select \n\
			d.person_fullname, \n\
			d.person_subdivision_name, \n\
			d.person_position_name, \n\
			d.learning_name, \n\
			d.start_usage_date, \n\
			d.last_usage_date, \n\
			d.max_end_date, \n\
			d.percent_score, \n\
			d.[status], \n\
			case d.passing_require \n\
				when 'true' then 'Да' \n\
				else 'Нет' \n\
			end passing_require, \n\
			d.structure \n\
		from ( \n\
			select \n\
				ls.person_fullname, \n\
				ls.person_subdivision_name, \n\
				cast(t.p.query(' \n\
					for $PD in  /collaborator/path_subs/path_sub \n\
					return \n\
						concat(data($PD/name[1]), \" / \") \n\
				') as varchar(max)) as structure, \n\
				ls.person_position_name, \n\
				ls.course_name learning_name, \n\
				ls.start_usage_date, \n\
				ls.last_usage_date, \n\
				ls.max_end_date, \n\
				case \n\
					when cs.max_score = 0 then null \n\
					else cast(ls.score as varchar) + '(' + cast(round((ls.score / cs.max_score) * 100, 0) as varchar) + '%)' \n\
				end percent_score, \n\
				cls.name [status], \n\
				r.p.query('custom_elem/name[text() = \"passing_require\"]/../value/text()').value('.', 'varchar(16)') passing_require \n\
			from learnings ls \n\
			inner join learning l on l.id = ls.id \n\
			inner join [common.learning_states] cls on cls.id = ls.state_id \n\
			inner join courses cs on cs.id = ls.course_id \n\
			inner join collaborator cr on cr.id = ls.person_id \n\
			inner join collaborators crs on crs.id = ls.person_id \n\
			cross apply cr.data.nodes('/collaborator/path_subs') as t(p) \n\
			outer apply l.data.nodes('/learning/custom_elems') as r(p)  \n\
			where \n\
				(t.p.exist('path_sub/id[(. cast as xs:string?) = \"" + subId + "\"]') = 1) \n\
				and crs.is_dismiss = 0 \n\
				and (ls.person_id in (select id from @_subordinates) or @_subordinatesCount = 0) \n\
				and (ls.course_id in (select id from @_learnings) or @_learningsCount = 0) \n\
			union \n\
			select \n\
				als.person_fullname, \n\
				als.person_subdivision_name, \n\
				cast(t.p.query(' \n\
					for $PD in  /collaborator/path_subs/path_sub \n\
					return \n\
						concat(data($PD/name[1]), \" / \") \n\
				') as varchar(max)) as structure, \n\
				als.person_position_name, \n\
				als.course_name learning_name, \n\
				als.start_usage_date, \n\
				als.last_usage_date, \n\
				als.max_end_date, \n\
				case \n\
					when cs.max_score = 0 then null \n\
					else cast(als.score as varchar) + '(' + cast(round((als.score / cs.max_score) * 100, 0) as varchar) + '%)'  \n\
				end percent_score, \n\
				cls.name [status], \n\
				r.p.query('custom_elem/name[text() = \"passing_require\"]/../value/text()').value('.', 'varchar(16)') passing_require \n\
			from active_learnings als \n\
			inner join active_learning al on al.id = als.id \n\
			inner join [common.learning_states] cls on cls.id = als.state_id \n\
			inner join courses cs on cs.id = als.course_id \n\
			inner join collaborator cr on cr.id = als.person_id \n\
			inner join collaborators crs on crs.id = als.person_id \n\
			cross apply cr.data.nodes('/collaborator/path_subs') as t(p) \n\
			outer apply al.data.nodes('/active_learning/custom_elems') as r(p) \n\
			where \n\
				(t.p.exist('path_sub/id[(. cast as xs:string?) = \"" + subId + "\"]') = 1) \n\
				and crs.is_dismiss = 0 \n\
				and (als.person_id in (select id from @_subordinates) or @_subordinatesCount = 0) \n\
				and (als.course_id in (select id from @_learnings) or @_learningsCount = 0) \n\
		) d \n\
	";

	//alert(strq);

	return XQuery(strq);
}

function getTestLearnings(subId, _subordinates, _learnings) {
	var s = _subordinates.join('),(');
	var l = _learnings.join('),(');

	var strq = "sql: \n\
		declare @_subordinates table (id bigint); \n\
		" + (_subordinates.length == 0 ? '' : 'insert into @_subordinates (id) values (' + s + ');') + " \n\
		declare @_subordinatesCount int = (select count(id) from @_subordinates); \n\
		\n\
		declare @_learnings table (id bigint); \n\
		" + (_learnings.length == 0 ? '' : 'insert into @_learnings (id) values (' + l + ');') + " \n\
		declare @_learningsCount int = (select count(id) from @_learnings); \n\
		\n\
		select \n\
			d.person_fullname, \n\
			d.person_subdivision_name, \n\
			d.person_position_name, \n\
			d.learning_name, \n\
			d.start_usage_date, \n\
			d.last_usage_date, \n\
			d.max_end_date, \n\
			d.percent_score, \n\
			d.[status], \n\
			case d.passing_require \n\
				when 'true' then 'Да' \n\
				else 'Нет' \n\
			end passing_require, \n\
			d.structure \n\
		from ( \n\
			select \n\
				ls.person_fullname, \n\
				ls.person_subdivision_name, \n\
				cast(t.p.query(' \n\
					for $PD in  /collaborator/path_subs/path_sub \n\
					return \n\
						concat(data($PD/name[1]), \" / \") \n\
				') as varchar(max)) as structure, \n\
				ls.person_position_name, \n\
				ls.assessment_name learning_name, \n\
				ls.start_usage_date, \n\
				ls.last_usage_date, \n\
				ls.max_end_date, \n\
				case \n\
					when cs.passing_score = 0 then null \n\
					else cast(ls.score as varchar) + '(' + cast(round((ls.score / cs.passing_score) * 100, 0) as varchar) + '%)' \n\
				end percent_score, \n\
				cls.name [status], \n\
				r.p.query('custom_elem/name[text() = \"passing_require\"]/../value/text()').value('.', 'varchar(16)') passing_require \n\
			from test_learnings ls \n\
			inner join test_learning l on l.id = ls.id \n\
			inner join [common.learning_states] cls on cls.id = ls.state_id \n\
			inner join assessments cs on cs.id = ls.assessment_id \n\
			inner join collaborator cr on cr.id = ls.person_id \n\
			inner join collaborators crs on crs.id = ls.person_id \n\
			cross apply cr.data.nodes('/collaborator/path_subs') as t(p) \n\
			outer apply l.data.nodes('/test_learning/custom_elems') as r(p) \n\
			where \n\
				(t.p.exist('path_sub/id[(. cast as xs:string?) = \"" + subId + "\"]') = 1) \n\
				and crs.is_dismiss = 0 \n\
				and (ls.person_id in (select id from @_subordinates) or @_subordinatesCount = 0) \n\
				and (ls.assessment_id in (select id from @_learnings) or @_learningsCount = 0) \n\
			union \n\
			select \n\
				als.person_fullname, \n\
				als.person_subdivision_name, \n\
				cast(t.p.query(' \n\
					for $PD in  /collaborator/path_subs/path_sub \n\
					return \n\
						concat(data($PD/name[1]), \" / \") \n\
				') as varchar(max)) as structure, \n\
				als.person_position_name, \n\
				als.assessment_name learning_name, \n\
				als.start_usage_date, \n\
				als.last_usage_date, \n\
				als.max_end_date, \n\
				case \n\
					when cs.passing_score = 0 then null \n\
					else cast(als.score as varchar) + '(' + cast(round((als.score / cs.passing_score) * 100, 0) as varchar) + '%)'  \n\
				end percent_score, \n\
				cls.name [status], \n\
				r.p.query('custom_elem/name[text() = \"passing_require\"]/../value/text()').value('.', 'varchar(16)') passing_require \n\
			from active_test_learnings als \n\
			inner join active_test_learning al on al.id = als.id \n\
			inner join [common.learning_states] cls on cls.id = als.state_id \n\
			inner join assessments cs on cs.id = als.assessment_id \n\
			inner join collaborator cr on cr.id = als.person_id \n\
			inner join collaborators crs on crs.id = als.person_id \n\
			cross apply cr.data.nodes('/collaborator/path_subs') as t(p) \n\
			outer apply al.data.nodes('/active_test_learning/custom_elems') as r(p) \n\
			where \n\
				(t.p.exist('path_sub/id[(. cast as xs:string?) = \"" + subId + "\"]') = 1) \n\
				and crs.is_dismiss = 0 \n\
				and (als.person_id in (select id from @_subordinates) or @_subordinatesCount = 0) \n\
				and (als.assessment_id in (select id from @_learnings) or @_learningsCount = 0) \n\
		) d \n\
	";

	//alert(strq);

	return XQuery(strq);
}